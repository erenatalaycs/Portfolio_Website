// src/scene/Lighting.tsx
//
// Three lights total (D-07): ambient + directional key + (the emissive
// surfaces on monitors/lamp count as the third bucket). NO rim, NO fill,
// NO point lights, NO environment map.
//
// Source: 02-UI-SPEC.md § Lighting (D-07); 02-CONTEXT.md D-07

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        intensity={0.8}
        position={[3, 4, 2]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}
