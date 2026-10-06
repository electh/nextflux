import { Ripple as RipplePrimitive } from "m3-ripple";

export function Ripple({ disabled = false }) {
  return (
    <RipplePrimitive
      className="app-ripple"
      disabled={disabled}
      hoverOpacity={0}
      pressedOpacity={0.05}
      duration={140}
      minimumPressDuration={180}
    />
  );
}
