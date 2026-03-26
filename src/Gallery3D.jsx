import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
   ARTWORK DATA
   ═══════════════════════════════════════════════════════════════ */
const ARTWORKS = [
  { id: 1, title: "Ephemeral Garden", artist: "TheVertMenthe", year: "2024", medium: "Ink on paper", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1024&q=80", position: [-8, 2.2, -7.8], rotation: [0, 0, 0], wall: "back" },
  { id: 2, title: "Silent Waves", artist: "TheVertMenthe", year: "2024", medium: "Watercolor", src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1024&q=80", position: [-3.5, 2.2, -7.8], rotation: [0, 0, 0], wall: "back" },
  { id: 3, title: "Urban Fragments", artist: "TheVertMenthe", year: "2023", medium: "Mixed media", src: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1024&q=80", position: [1, 2.2, -7.8], rotation: [0, 0, 0], wall: "back" },
  { id: 4, title: "Nocturne in Blue", artist: "TheVertMenthe", year: "2023", medium: "Ink on paper", src: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1024&q=80", position: [5.5, 2.2, -7.8], rotation: [0, 0, 0], wall: "back" },
  { id: 5, title: "Verdant Dreams", artist: "TheVertMenthe", year: "2024", medium: "Oil on canvas", src: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1024&q=80", position: [-8, 2.2, 7.8], rotation: [0, Math.PI, 0], wall: "front" },
  { id: 6, title: "Whispered Lines", artist: "TheVertMenthe", year: "2023", medium: "Charcoal", src: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=1024&q=80", position: [-3.5, 2.2, 7.8], rotation: [0, Math.PI, 0], wall: "front" },
  { id: 7, title: "Terracotta Bloom", artist: "TheVertMenthe", year: "2024", medium: "Acrylic", src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1024&q=80", position: [1, 2.2, 7.8], rotation: [0, Math.PI, 0], wall: "front" },
  { id: 8, title: "Abstract Meridian", artist: "TheVertMenthe", year: "2023", medium: "Mixed media", src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1024&q=80", position: [5.5, 2.2, 7.8], rotation: [0, Math.PI, 0], wall: "front" },
  { id: 9, title: "Mint Passage", artist: "TheVertMenthe", year: "2024", medium: "Digital", src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1024&q=80", position: [-11.8, 2.2, -3], rotation: [0, Math.PI / 2, 0], wall: "left" },
  { id: 10, title: "Solstice", artist: "TheVertMenthe", year: "2024", medium: "Watercolor", src: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=1024&q=80", position: [-11.8, 2.2, 3], rotation: [0, Math.PI / 2, 0], wall: "left" },
];

/* ═══════════════════════════════════════════════════════════════
   GALLERY ROOM (Procedural)
   ═══════════════════════════════════════════════════════════════ */
function GalleryRoom() {
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f5f5f0",
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#e8e4dc",
    roughness: 0.85,
    metalness: 0.02,
  }), []);

  const ceilingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#fafaf5",
    roughness: 1,
    metalness: 0,
  }), []);

  const molding = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ddd8d0",
    roughness: 0.7,
    metalness: 0.05,
  }), []);

  const roomW = 24, roomH = 5, roomD = 16;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomH, 0]} material={ceilingMaterial}>
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* Back wall (Z-) */}
      <mesh position={[0, roomH / 2, -roomD / 2]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[roomW, roomH]} />
      </mesh>

      {/* Front wall (Z+) */}
      <mesh position={[0, roomH / 2, roomD / 2]} rotation={[0, Math.PI, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[roomW, roomH]} />
      </mesh>

      {/* Left wall (X-) */}
      <mesh position={[-roomW / 2, roomH / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* Right wall (X+) */}
      <mesh position={[roomW / 2, roomH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* Floor molding strips */}
      {[
        [0, 0.05, -roomD / 2 + 0.01, roomW, 0.1, 0],
        [0, 0.05, roomD / 2 - 0.01, roomW, 0.1, Math.PI],
        [-roomW / 2 + 0.01, 0.05, 0, roomD, 0.1, Math.PI / 2],
        [roomW / 2 - 0.01, 0.05, 0, roomD, 0.1, -Math.PI / 2],
      ].map(([x, y, z, w, h, ry], i) => (
        <mesh key={`mold-${i}`} position={[x, y, z]} rotation={[0, ry, 0]} material={molding}>
          <boxGeometry args={[w, h, 0.08]} />
        </mesh>
      ))}

      {/* Ceiling molding */}
      {[
        [0, roomH - 0.05, -roomD / 2 + 0.01, roomW, 0.1, 0],
        [0, roomH - 0.05, roomD / 2 - 0.01, roomW, 0.1, Math.PI],
        [-roomW / 2 + 0.01, roomH - 0.05, 0, roomD, 0.1, Math.PI / 2],
        [roomW / 2 - 0.01, roomH - 0.05, 0, roomD, 0.1, -Math.PI / 2],
      ].map(([x, y, z, w, h, ry], i) => (
        <mesh key={`cmold-${i}`} position={[x, y, z]} rotation={[0, ry, 0]} material={molding}>
          <boxGeometry args={[w, h, 0.08]} />
        </mesh>
      ))}

      {/* Central bench */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[2.5, 0.08, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
        </mesh>
        {[[-1, 0], [1, 0]].map(([x, z], i) => (
          <mesh key={`leg-${i}`} position={[x, 0.17, z]} castShadow>
            <boxGeometry args={[0.06, 0.34, 0.5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAINTING ON WALL
   ═══════════════════════════════════════════════════════════════ */
function Painting({ artwork, onApproach, characterPos }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [near, setNear] = useState(false);
  const texture = useTexture(artwork.src);

  // Aspect ratio of frame
  const frameW = 3;
  const frameH = 2.4;
  const frameDepth = 0.06;

  // Check proximity to character
  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...artwork.position).distanceTo(
      new THREE.Vector3(characterPos[0], artwork.position[1], characterPos[2])
    );
    const isNear = dist < 4;
    if (isNear !== near) setNear(isNear);
  });

  return (
    <group position={artwork.position} rotation={artwork.rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[frameW + 0.15, frameH + 0.15, frameDepth]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Canvas/Image */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={() => near && onApproach(artwork)}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial map={texture} roughness={0.6} />
      </mesh>

      {/* "See Details" prompt */}
      {near && (
        <Html position={[0, -frameH / 2 - 0.5, 0.2]} center
              style={{ pointerEvents: "none", userSelect: "none" }}>
          <div style={{
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            animation: "fadeInUp 0.4s ease",
          }}>
            Click to view
          </div>
        </Html>
      )}

      {/* Subtle wall light above painting */}
      <pointLight position={[0, frameH / 2 + 0.8, 0.5]} intensity={0.6} distance={5} color="#fff5e6" castShadow={false} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHARACTER SPRITE (2D avatar on 3D floor)
   ═══════════════════════════════════════════════════════════════ */
function useKeyboard() {
  const keys = useRef({});
  useEffect(() => {
    const onDown = (e) => { keys.current[e.code] = true; };
    const onUp = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);
  return keys;
}

function Character({ targetPos, onPositionUpdate }) {
  const meshRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 3));
  const [walking, setWalking] = useState(false);
  const bobPhase = useRef(0);
  const keys = useKeyboard();
  const facingAngle = useRef(0);

  // Room bounds
  const BOUNDS = { minX: -11, maxX: 11, minZ: -7, maxZ: 7 };

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const current = currentPos.current;
    const speed = 4.5;
    const moveDir = new THREE.Vector3(0, 0, 0);
    let isKeyMoving = false;

    // WASD / Arrow keys
    const k = keys.current;
    if (k["KeyW"] || k["ArrowUp"])    { moveDir.z -= 1; isKeyMoving = true; }
    if (k["KeyS"] || k["ArrowDown"])  { moveDir.z += 1; isKeyMoving = true; }
    if (k["KeyA"] || k["ArrowLeft"])  { moveDir.x -= 1; isKeyMoving = true; }
    if (k["KeyD"] || k["ArrowRight"]) { moveDir.x += 1; isKeyMoving = true; }

    // Sprint with Shift
    const sprint = k["ShiftLeft"] || k["ShiftRight"] ? 1.6 : 1;

    if (isKeyMoving) {
      moveDir.normalize();
      current.x += moveDir.x * speed * sprint * delta;
      current.z += moveDir.z * speed * sprint * delta;

      // Clamp to room bounds
      current.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, current.x));
      current.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, current.z));

      // Walk bob
      bobPhase.current += delta * 14;
      meshRef.current.position.y = 0.5 + Math.abs(Math.sin(bobPhase.current)) * 0.08;

      // Face movement direction (smooth)
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      facingAngle.current += ((((targetAngle - facingAngle.current) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * 8 * delta;
      meshRef.current.rotation.y = facingAngle.current;

      setWalking(true);
    } else if (targetPos) {
      // Click-to-move fallback
      const target = new THREE.Vector3(targetPos[0], 0, targetPos[2]);
      const dist = current.distanceTo(target);

      if (dist > 0.08) {
        setWalking(true);
        const dir = target.clone().sub(current).normalize();
        current.add(dir.multiplyScalar(Math.min(3.5 * delta, dist)));

        // Clamp to room bounds
        current.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, current.x));
        current.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, current.z));

        bobPhase.current += delta * 12;
        meshRef.current.position.y = 0.5 + Math.abs(Math.sin(bobPhase.current)) * 0.08;

        const angle = Math.atan2(dir.x, dir.z);
        facingAngle.current = angle;
        meshRef.current.rotation.y = angle;
      } else {
        setWalking(false);
        meshRef.current.position.y = 0.5;
      }
    }

    meshRef.current.position.x = current.x;
    meshRef.current.position.z = current.z;

    onPositionUpdate([current.x, current.y, current.z]);
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 3]}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Shadow on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOOR HOTSPOTS
   ═══════════════════════════════════════════════════════════════ */
function FloorHotspot({ position, onClick, label }) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
      ringRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <group position={[position[0], 0.01, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onClick(position); }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color={hovered ? "#555" : "#333"} transparent opacity={hovered ? 0.5 : 0.25} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.5, 32]} />
        <meshBasicMaterial color="#666" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMERA CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function CameraController({ characterPos, zoomedArtwork }) {
  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3(0, 2.5, 8));
  const lookTarget = useRef(new THREE.Vector3(0, 2, 0));

  useFrame((_, delta) => {
    if (zoomedArtwork) return; // GSAP handles the zoom

    // Follow character from behind and above
    const idealPos = new THREE.Vector3(
      characterPos[0] * 0.3,
      3.2,
      characterPos[2] + 6
    );
    const idealLook = new THREE.Vector3(
      characterPos[0],
      1.8,
      characterPos[2] - 2
    );

    cameraTarget.current.lerp(idealPos, 2.5 * delta);
    lookTarget.current.lerp(idealLook, 2.5 * delta);

    camera.position.copy(cameraTarget.current);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════ */
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", left: pos.x, top: pos.y,
      width: clicking ? 12 : 20, height: clicking ? 12 : 20,
      border: "1.5px solid rgba(255,255,255,0.6)",
      borderRadius: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: 9999,
      transition: "width 0.15s, height 0.15s",
      mixBlendMode: "difference",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOOR CLICK HANDLER
   ═══════════════════════════════════════════════════════════════ */
function FloorClickPlane({ onFloorClick }) {
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const point = e.point;
    // Clamp to room bounds
    const x = Math.max(-11, Math.min(11, point.x));
    const z = Math.max(-7, Math.min(7, point.z));
    onFloorClick([x, 0, z]);
  }, [onFloorClick]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}
          onClick={handleClick}>
      <planeGeometry args={[24, 16]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D SCENE
   ═══════════════════════════════════════════════════════════════ */
function Scene({ onZoomArtwork, zoomedArtwork }) {
  const [targetPos, setTargetPos] = useState(null);
  const [charPos, setCharPos] = useState([0, 0, 3]);

  const hotspots = useMemo(() => [
    // Near back wall artworks
    { pos: [-8, 0, -4.5], label: "1" },
    { pos: [-3.5, 0, -4.5], label: "2" },
    { pos: [1, 0, -4.5], label: "3" },
    { pos: [5.5, 0, -4.5], label: "4" },
    // Near front wall artworks
    { pos: [-8, 0, 4.5], label: "5" },
    { pos: [-3.5, 0, 4.5], label: "6" },
    { pos: [1, 0, 4.5], label: "7" },
    { pos: [5.5, 0, 4.5], label: "8" },
    // Near left wall
    { pos: [-9, 0, -3], label: "9" },
    { pos: [-9, 0, 3], label: "10" },
    // Center
    { pos: [0, 0, 0], label: "C" },
  ], []);

  const handleFloorClick = useCallback((pos) => {
    if (zoomedArtwork) return;
    setTargetPos(pos);
  }, [zoomedArtwork]);

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.4} color="#f5f0e8" />
      <directionalLight position={[5, 8, 3]} intensity={0.7} color="#fff5e6" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15}
        shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 6, -3]} intensity={0.3} color="#e8f0ff" />

      {/* Ceiling lights */}
      {[-6, 0, 6].map((x, i) => (
        <group key={`clight-${i}`}>
          <pointLight position={[x, 4.8, 0]} intensity={0.8} distance={12} color="#fff8ee" />
          <mesh position={[x, 4.95, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}

      <GalleryRoom />

      {/* Artworks */}
      {ARTWORKS.map(art => (
        <Suspense key={art.id} fallback={null}>
          <Painting artwork={art} onApproach={onZoomArtwork} characterPos={charPos} />
        </Suspense>
      ))}

      {/* Floor hotspots */}
      {!zoomedArtwork && hotspots.map((h, i) => (
        <FloorHotspot key={i} position={h.pos} label={h.label}
                      onClick={handleFloorClick} />
      ))}

      {/* Clickable floor */}
      <FloorClickPlane onFloorClick={handleFloorClick} />

      {/* Character */}
      <Character targetPos={targetPos} onPositionUpdate={setCharPos} />

      {/* Camera */}
      <CameraController characterPos={charPos} zoomedArtwork={zoomedArtwork} />

      {/* Fog for depth */}
      <fog attach="fog" args={["#0a0a0a", 15, 35]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTWORK DETAIL OVERLAY (2D)
   ═══════════════════════════════════════════════════════════════ */
function ArtworkDetail({ artwork, onClose }) {
  const overlayRef = useRef();
  const imgRef = useRef();

  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    gsap.fromTo(imgRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.35, ease: "power2.in",
      onComplete: onClose,
    });
  };

  return (
    <div ref={overlayRef}
         style={{
           position: "fixed", inset: 0, zIndex: 100,
           background: "rgba(5,5,5,0.95)",
           backdropFilter: "blur(20px)",
           display: "flex", flexDirection: "column",
           alignItems: "center", justifyContent: "center",
           padding: "2rem",
         }}>
      {/* Close button */}
      <button onClick={handleClose}
              style={{
                position: "absolute", top: "2rem", right: "2rem",
                background: "none", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", padding: "10px 24px", borderRadius: "30px",
                fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.target.style.background = "none"; }}>
        Close ×
      </button>

      {/* Artwork image */}
      <div ref={imgRef} style={{ maxWidth: "70vw", maxHeight: "65vh" }}>
        <img src={artwork.src} alt={artwork.title}
             style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
      </div>

      {/* Info */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: 300, color: "#fff", marginBottom: "0.5rem",
        }}>
          {artwork.title}
        </h2>
        <p style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif",
        }}>
          {artwork.artist} · {artwork.medium} · {artwork.year}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HUD OVERLAY
   ═══════════════════════════════════════════════════════════════ */
function HUD({ artworkCount }) {
  return (
    <>
      {/* Top left - Logo */}
      <div style={{
        position: "fixed", top: "1.5rem", left: "2rem", zIndex: 50,
        pointerEvents: "none",
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.3rem", fontWeight: 300,
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#fff",
        }}>
          TheVert<span style={{ color: "#888" }}>Menthe</span>
        </h1>
      </div>

      {/* Top right - Artwork count */}
      <div style={{
        position: "fixed", top: "1.5rem", right: "2rem", zIndex: 50,
        pointerEvents: "none",
      }}>
        <p style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif",
        }}>
          {artworkCount} drawings
        </p>
      </div>

      {/* Bottom left - Breadcrumb */}
      <div style={{
        position: "fixed", bottom: "1.5rem", left: "2rem", zIndex: 50,
        display: "flex", gap: "8px", alignItems: "center",
        pointerEvents: "none",
      }}>
        {["Home", "Gallery"].map((item, i) => (
          <span key={item} style={{
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: i === 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
            fontFamily: "'Inter', sans-serif",
          }}>
            {item}{i < 1 && <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.15)" }}>&gt;</span>}
          </span>
        ))}
      </div>

      {/* Bottom right - Controls hint */}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "2rem", zIndex: 50,
        pointerEvents: "none",
      }}>
        <p style={{
          fontSize: "10px", letterSpacing: "2px",
          color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif",
        }}>
          WASD / Arrows to move · Shift to sprint · Click artwork to view
        </p>
      </div>

      {/* Bottom center - Social */}
      <div style={{
        position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 50, display: "flex", gap: "24px", alignItems: "center",
      }}>
        <a href="https://instagram.com" target="_blank" rel="noreferrer"
           style={{
             fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
             color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif",
             textDecoration: "none", transition: "color 0.3s",
           }}
           onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
           onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
          Instagram
        </a>
        <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
        <a href="mailto:contact@thevertmenthe.fr"
           style={{
             fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
             color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif",
             textDecoration: "none", transition: "color 0.3s",
           }}
           onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
           onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
          Contact
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN
   ═══════════════════════════════════════════════════════════════ */
function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 600);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: "opacity 0.6s ease",
      opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? "none" : "all",
    }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 300, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#fff",
        marginBottom: "2rem",
      }}>
        TheVert<span style={{ color: "#666" }}>Menthe</span>
      </h1>
      <div style={{
        width: "200px", height: "1px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "1px", overflow: "hidden",
      }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`, height: "100%",
          background: "#fff",
          transition: "width 0.3s ease",
        }} />
      </div>
      <p style={{
        marginTop: "1rem", fontSize: "10px",
        letterSpacing: "3px", color: "rgba(255,255,255,0.3)",
        fontFamily: "'Inter', sans-serif",
      }}>
        Entering gallery...
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function Gallery3D() {
  const [zoomedArtwork, setZoomedArtwork] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      <LoadingScreen />
      <CustomCursor />
      <HUD artworkCount={ARTWORKS.length} />

      <Canvas
        shadows
        camera={{ position: [0, 3.2, 9], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene onZoomArtwork={setZoomedArtwork} zoomedArtwork={zoomedArtwork} />
        </Suspense>
      </Canvas>

      {zoomedArtwork && (
        <ArtworkDetail artwork={zoomedArtwork} onClose={() => setZoomedArtwork(null)} />
      )}
    </div>
  );
}
