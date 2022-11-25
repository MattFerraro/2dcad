class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  stateVector = () => {
    return [this.x, this.y]
  }
}

class Line {
  constraints = []
  constructor(start, end) {
    this.start = start
    this.end = end
  }
  variables = () => {
    return [this.start, this.end]
  }
  length = () => {
    const dx = this.end.x - this.start.x
    const dy = this.end.y - this.start.y
    return Math.hypot(dx, dy)
  }
}

class LineLengthConstraint {
  constructor(line, length) {
    this.line = line
    this.length = length
    line.constraints.push(this)
  }

  variables = () => {
    return this.line.variables()
  }

  cost = () => {
    const dx = this.line.end.x - this.line.start.x
    const dy = this.line.end.y - this.line.start.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const error = dist - this.length
    const errorSquared = error * error
    return errorSquared
  }

  dCost = () => {
    const dx = this.line.end.x - this.line.start.x
    const dy = this.line.end.y - this.line.start.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const error = dist - this.length
    const dCostDx = (2 * dx * error) / dist
    const dCostDy = (2 * dy * error) / dist
    const dCostDa = -dCostDx
    const dCostDb = -dCostDy

    const retVal = new Map()
    retVal.set(this.line.start, [dCostDa, dCostDb])
    retVal.set(this.line.end, [dCostDx, dCostDy])
    return retVal
  }
}

class Solver {
  constraints = []
  variables = []
  stateVector = []
  offsetsByVariable = new Map()
  costThreshold = 1e-11
  solve = () => {
    let offset = 0
    this.stateVector = []
    for (let v of this.variables) {
      this.offsetsByVariable.set(v, offset)
      const sv = v.stateVector()
      this.stateVector = this.stateVector.concat(sv)
      offset += sv.length
    }
    let stepSize = -0.05

    const maxSteps = 1500
    for (let i = 0; i < maxSteps; i++) {
      const cost = this.costFunc()
      if (cost < this.costThreshold) {
        return { success: i }
      }
      const partials = this.dCost()
      this.step(partials, stepSize)
    }

    return { failure: maxSteps }
  }

  step = (partials, stepSize) => {
    for (let v of this.variables) {
      const offset = this.offsetsByVariable.get(v)
      const dx = partials[offset]
      const dy = partials[offset + 1]
      v.x += dx * stepSize
      v.y += dy * stepSize
    }
  }

  costFunc = () => {
    let totalCost = 0
    for (let c of this.constraints) {
      totalCost += c.cost()
    }
    return totalCost
  }

  dCost = () => {
    const partials = new Array(this.variables.length * 2).fill(0)
    for (let c of this.constraints) {
      const localPartials = c.dCost()
      for (let [variable, partial] of localPartials) {
        let offset = this.offsetsByVariable.get(variable)

        for (let onePartial of partial) {
          partials[offset] += onePartial
          offset += 1
        }
      }
    }
    return partials
  }
}

export { Point, Line, LineLengthConstraint, Solver }
