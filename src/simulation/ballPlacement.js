import { TABLE_BOUNDS } from '@/simulation/tableCollision';

export function worldPointToTablePoint(worldPoint) {
  return {
    x: worldPoint.x,
    y: -worldPoint.z,
  };
}

export function isPointOnTable(point, margin = 0.001) {
  return (
    point.x >= TABLE_BOUNDS.minX + margin &&
    point.x <= TABLE_BOUNDS.maxX - margin &&
    point.y >= TABLE_BOUNDS.minY + margin &&
    point.y <= TABLE_BOUNDS.maxY - margin
  );
}

export function findNearestFreePosition(target, radius, occupiedBalls = [], ignoreBall = null) {
  const initial = {
    x: target?.x ?? 0,
    y: target?.y ?? 0,
  };

  const occupancyRadius = radius * 2.1;

  const isOccupied = (candidate) => {
    return occupiedBalls.some((otherBall) => {
      if (!otherBall || otherBall === ignoreBall) return false;
      if (otherBall.pocketed || otherBall.jumpedOff) return false;

      const dx = candidate.x - otherBall.position.x;
      const dy = candidate.y - otherBall.position.y;
      return Math.hypot(dx, dy) < occupancyRadius;
    });
  };

  if (!isOccupied(initial) && isPointOnTable(initial)) {
    return initial;
  }

  const step = Math.max(radius * 0.8, 0.03);

  for (let ring = 1; ring <= 12; ring += 1) {
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const candidate = {
        x: initial.x + Math.cos(angle) * step * ring,
        y: initial.y + Math.sin(angle) * step * ring,
      };

      if (!isPointOnTable(candidate)) continue;
      if (!isOccupied(candidate)) return candidate;
    }
  }

  return initial;
}