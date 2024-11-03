import TransitionLink from "../utils/TransitionLink";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle/ModeToggle";

const NavLinks = () => {
  return (
    <div className="flex items-center gap-6 font-bold ">
      <TransitionLink href="/">
        <Logo />
      </TransitionLink>
      <TransitionLink href="/search">Search</TransitionLink>
      <TransitionLink href="/city">City</TransitionLink>
      <TransitionLink href="/favorites">Favorites</TransitionLink>
    </div>
  );
};
const Logo = () => {
  return (
    <div>
      <svg
        className="logo h-8 w-8 p-1 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm outline outline-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="1549.9814 1546.9673 4428.4873 4433.1108"
      >
        <g
          id="object-0"
          transform="matrix(1, 0, 0, 1, -2.2737367544323206e-13, 0)"
        >
          <path
            style={{
              opacity: 0.998,
              pointerEvents: "none",
              paintOrder: "stroke markers",
              fillRule: "evenodd",
              fill: "rgb(255, 255, 255)",
            }}
            d="M 3578.5,1547.5 C 3894.91,1540.35 4195.58,1605.18 4480.5,1742C 4686.03,1843.38 4867.53,1977.54 5025,2144.5C 5210.17,2340.5 5366.17,2557.5 5493,2795.5C 5618.99,3034.78 5718.32,3284.78 5791,3545.5C 5870.2,3832.05 5923.54,4123.38 5951,4419.5C 5991.81,4859.32 5987.15,5298.65 5937,5737.5C 5930.19,5796.04 5922.02,5854.37 5912.5,5912.5C 5746.07,5938.75 5578.73,5956.92 5410.5,5967C 5036.98,5991.17 4664.31,5981.84 4292.5,5939C 3989.35,5904.17 3692.35,5840.84 3401.5,5749C 3168.71,5674.64 2945.71,5577.97 2732.5,5459C 2504.09,5330.39 2296.09,5174.06 2108.5,4990C 1818.24,4699.01 1639.74,4349.17 1573,3940.5C 1509.04,3499.93 1578.37,3081.59 1781,2685.5C 1946.51,2369.62 2176.34,2110.12 2470.5,1907C 2804.7,1681.22 3174.04,1561.38 3578.5,1547.5 Z M 3539.5,2346.5 C 3540.75,2346.58 3541.58,2347.24 3542,2348.5C 3671.43,2615.87 3801.27,2883.03 3931.5,3150C 4199.18,3280.17 4466.84,3410.34 4734.5,3540.5C 4466.84,3670.66 4199.18,3800.83 3931.5,3931C 3801.03,4198.77 3670.7,4466.6 3540.5,4734.5C 3410.34,4466.84 3280.17,4199.18 3150,3931.5C 2882.23,3801.03 2614.4,3670.7 2346.5,3540.5C 2614.4,3410.3 2882.23,3279.97 3150,3149.5C 3280.39,2882.06 3410.22,2614.39 3539.5,2346.5 Z"
          />
        </g>
      </svg>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="p-4 flex items-center justify-between w-screen absolute">
      <NavLinks />
      <div className="gap-2 flex items-center">
        <ModeToggle />
        <Button>Sign In</Button>
      </div>
    </nav>
  );
};

export default Navbar;
