
export default function calculateInertia(
    mass,
    radius
) {
    return (
        (2 / 5) *
        mass *
        radius *
        radius
    );
}