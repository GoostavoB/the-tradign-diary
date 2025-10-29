import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

interface WidgetData {
  id: string;
  title: string;
  value: string;
  trend: string;
  color: string;
}

interface FloatingWidgetProps {
  position: [number, number, number];
  rotation: [number, number, number];
  data: WidgetData;
}

const FloatingWidget = ({ position, rotation, data }: FloatingWidgetProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.1;
    
    // Subtle rotation wobble
    meshRef.current.rotation.x = rotation[0] + Math.sin(time * 0.3) * 0.05;
    meshRef.current.rotation.y = rotation[1] + Math.cos(time * 0.4) * 0.05;
    
    // Hover effect
    if (hovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glass card base */}
      <RoundedBox
        args={[1.2, 0.8, 0.1]}
        radius={0.05}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#0A0A0A"
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          transmission={0.1}
        />
      </RoundedBox>

      {/* Accent border */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[1.18, 0.78]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.2} />
      </mesh>

      {/* HTML content overlay for text */}
      <Html
        transform
        position={[0, 0, 0.06]}
        distanceFactor={1.2}
        style={{
          width: '120px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center px-2">
          <p className="text-[8px] text-gray-400 mb-1">{data.title}</p>
          <p className="text-[14px] font-bold text-white mb-1">{data.value}</p>
          <p className="text-[7px]" style={{ color: data.color }}>{data.trend}</p>
        </div>
      </Html>

      {/* Glow effect on hover */}
      {hovered && (
        <pointLight
          position={[0, 0, 0.5]}
          intensity={0.5}
          distance={2}
          color={data.color}
        />
      )}
    </group>
  );
};

export default FloatingWidget;
