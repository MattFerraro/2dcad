import { render, screen } from "@testing-library/react"
import App from "./App"
import * as Api from "./Api"

test("renders learn react link", () => {
  render(<App />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})

test("can create lines", () => {
  const p0 = new Api.Point(0, 0)
  const p1 = new Api.Point(1, 0)
  const p2 = new Api.Point(1, 1)

  const l0 = new Api.Line(p0, p1)
  const c0 = new Api.LineLengthConstraint(l0, 1)

  const l1 = new Api.Line(p1, p2)
  const c1 = new Api.LineLengthConstraint(l1, 1)

  const l2 = new Api.Line(p0, p2)
  const c2 = new Api.LineLengthConstraint(l2, 1)

  const s = new Api.Solver()
  s.variables = [p0, p1, p2]
  s.constraints = [c0, c1, c2]
  s.solve()

  // Let's make sure we actually solved the problem!

  console.assert(
    Math.abs(l0.length() - 1) < 0.00001,
    "l0 length is not near constraint"
  )

  console.assert(
    Math.abs(l1.length() - 1) < 0.00001,
    "l0 length is not near constraint"
  )

  console.assert(
    Math.abs(l2.length() - 1) < 0.00001,
    "l0 length is not near constraint"
  )
})
