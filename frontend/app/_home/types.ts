import type { Weapon } from '../weapons/WeaponsClient'

export type WeaponPreview = Pick<Weapon, 'uuid' | 'displayName' | 'displayIcon'>
