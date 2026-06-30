import { SURFACE } from "@/global/constants";

/** options
 * @param {object} [opts]
 */
export const SurfaceMaterial = ( opts = {}) => ({
  gravity: opts.gravity ?? SURFACE.gravity,
  muSliding: opts.muSliding ?? SURFACE.muSliding,
  muRolling: opts.muRolling ?? SURFACE.muRolling,
  spinDamping: opts.spinDamping ?? SURFACE.spinDamping
});