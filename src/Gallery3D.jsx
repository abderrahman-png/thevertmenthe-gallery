import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
   DEVELOPER ZONE DATA (replaces ARTWORKS)
   ═══════════════════════════════════════════════════════════════ */
const ZONES = [
  // Back wall — Projects
  { id: 1, type: "project", title: "E-Commerce Platform", desc: "Full-stack e-commerce app with React, Node.js, Stripe integration, and real-time inventory management.", tech: "React · Node.js · MongoDB · Stripe", link: "#", position: [-8, 2.2, -7.8], rotation: [0, 0, 0] },
  { id: 2, type: "project", title: "AI Chat Dashboard", desc: "Real-time AI-powered chat interface with streaming responses, auth, and analytics dashboard.", tech: "Next.js · OpenAI API · Socket.io · PostgreSQL", link: "#", position: [-3.5, 2.2, -7.8], rotation: [0, 0, 0] },
  { id: 3, type: "project", title: "3D Portfolio Gallery", desc: "This very site — an immersive 3D developer portfolio built with React Three Fiber and Three.js.", tech: "React · Three.js · R3F · GSAP", link: "#", position: [1, 2.2, -7.8], rotation: [0, 0, 0] },
  { id: 4, type: "project", title: "Task Management App", desc: "Collaborative project management tool with drag-and-drop boards, real-time sync, and team features.", tech: "React · Firebase · Tailwind · DnD Kit", link: "#", position: [5.5, 2.2, -7.8], rotation: [0, 0, 0] },

  // Front wall — More projects + Experience
  { id: 5, type: "project", title: "Social Media Analytics", desc: "Dashboard aggregating metrics from multiple platforms with custom charts and export capabilities.", tech: "Vue.js · D3.js · Express · Redis", link: "#", position: [-8, 2.2, 7.8], rotation: [0, Math.PI, 0] },
  { id: 6, type: "experience", title: "Work Experience", position: [-3.5, 2.2, 7.8], rotation: [0, Math.PI, 0] },
  { id: 7, type: "skills", title: "Tech Stack", position: [1, 2.2, 7.8], rotation: [0, Math.PI, 0] },
  { id: 8, type: "project", title: "DevOps Pipeline Tool", desc: "CI/CD visualization and management tool with GitHub integration and deployment tracking.", tech: "React · Go · Docker · GitHub API", link: "#", position: [5.5, 2.2, 7.8], rotation: [0, Math.PI, 0] },

  // Left wall — About & Contact
  { id: 9, type: "about", title: "About Me", position: [-11.8, 2.2, -3], rotation: [0, Math.PI / 2, 0] },
  { id: 10, type: "contact", title: "Contact", position: [-11.8, 2.2, 3], rotation: [0, Math.PI / 2, 0] },
];

const FRAME_W = 3, FRAME_H = 2.4, FRAME_DEPTH = 0.06;

/* ═══════════════════════════════════════════════════════════════
   GALLERY ROOM — Dark tech theme
   ═══════════════════════════════════════════════════════════════ */
function GalleryRoom() {
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1e2e",
    roughness: 0.92,
    metalness: 0.05,
  }), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#12151f",
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  const ceilingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0e1018",
    roughness: 1,
    metalness: 0,
  }), []);

  const molding = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2a3050",
    roughness: 0.6,
    metalness: 0.2,
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

      {/* Floor molding strips — neon accent */}
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

      {/* Floor neon edge strips */}
      {[
        [0, 0.02, -roomD / 2 + 0.05, roomW, 0],
        [0, 0.02, roomD / 2 - 0.05, roomW, Math.PI],
        [-roomW / 2 + 0.05, 0.02, 0, roomD, Math.PI / 2],
        [roomW / 2 - 0.05, 0.02, 0, roomD, -Math.PI / 2],
      ].map(([x, y, z, w, ry], i) => (
        <mesh key={`neon-${i}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, ry]}>
          <planeGeometry args={[w, 0.02]} />
          <meshBasicMaterial color="#4a9eff" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* No bench — removed */}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE: PROJECT CARD (Html in 3D)
   ═══════════════════════════════════════════════════════════════ */
function ProjectZone({ zone, characterPos, onApproach }) {
  const [near, setNear] = useState(false);

  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...zone.position).distanceTo(
      new THREE.Vector3(characterPos[0], zone.position[1], characterPos[2])
    );
    setNear(dist < 4);
  });

  return (
    <group position={zone.position} rotation={zone.rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15, FRAME_DEPTH]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Screen glow */}
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#0d1520" />
      </mesh>

      {/* HTML content */}
      <Html transform position={[0, 0, FRAME_DEPTH / 2 + 0.01]}
            style={{ width: "280px", height: "220px", pointerEvents: "none" }}>
        <div style={{
          width: "280px", height: "220px", padding: "20px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          border: "1px solid rgba(74, 158, 255, 0.15)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4a9eff" }} />
              <span style={{ fontSize: "9px", color: "#4a9eff", letterSpacing: "2px", textTransform: "uppercase" }}>Project</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#e6edf3", margin: "0 0 8px 0", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.5px" }}>
              {zone.title}
            </h3>
            <p style={{ fontSize: "10px", color: "#8b949e", lineHeight: 1.5, margin: 0 }}>
              {zone.desc}
            </p>
          </div>
          <div style={{ borderTop: "1px solid rgba(74, 158, 255, 0.1)", paddingTop: "10px" }}>
            <p style={{ fontSize: "9px", color: "#4a9eff", letterSpacing: "1px", margin: 0 }}>
              {zone.tech}
            </p>
          </div>
        </div>
      </Html>

      {near && (
        <Html position={[0, -FRAME_H / 2 - 0.5, 0.2]} center style={{ pointerEvents: "none", userSelect: "none" }}>
          <div style={{
            background: "rgba(13,17,23,0.9)", color: "#4a9eff",
            padding: "8px 20px", borderRadius: "20px", fontSize: "11px",
            letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap", border: "1px solid rgba(74,158,255,0.3)", backdropFilter: "blur(10px)",
          }}>
            Click to expand
          </div>
        </Html>
      )}

      {/* Frame glow light */}
      <pointLight position={[0, FRAME_H / 2 + 0.8, 0.5]} intensity={0.4} distance={4} color="#4a9eff" />

      {/* Click target */}
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.02]}
            onClick={() => near && onApproach(zone)} visible={false}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE: SKILLS
   ═══════════════════════════════════════════════════════════════ */
const SKILLS = [
  { name: "React", color: "#61dafb" }, { name: "Node.js", color: "#68a063" },
  { name: "TypeScript", color: "#3178c6" }, { name: "Python", color: "#ffd43b" },
  { name: "Three.js", color: "#ffffff" }, { name: "PostgreSQL", color: "#336791" },
  { name: "Docker", color: "#2496ed" }, { name: "AWS", color: "#ff9900" },
  { name: "Git", color: "#f05032" }, { name: "GraphQL", color: "#e535ab" },
  { name: "Tailwind", color: "#38bdf8" }, { name: "MongoDB", color: "#47a248" },
];

function SkillsZone({ zone, characterPos, onApproach }) {
  const [near, setNear] = useState(false);

  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...zone.position).distanceTo(
      new THREE.Vector3(characterPos[0], zone.position[1], characterPos[2])
    );
    setNear(dist < 4);
  });

  return (
    <group position={zone.position} rotation={zone.rotation}>
      <mesh castShadow>
        <boxGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15, FRAME_DEPTH]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#0d1520" />
      </mesh>

      <Html transform position={[0, 0, FRAME_DEPTH / 2 + 0.01]}
            style={{ width: "280px", height: "220px", pointerEvents: "none" }}>
        <div style={{
          width: "280px", height: "220px", padding: "18px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          border: "1px solid rgba(74, 158, 255, 0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f0883e" }} />
            <span style={{ fontSize: "9px", color: "#f0883e", letterSpacing: "2px", textTransform: "uppercase" }}>Tech Stack</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {SKILLS.map(s => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "5px 8px", borderRadius: "4px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: "9px", color: "#c9d1d9" }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Html>

      <pointLight position={[0, FRAME_H / 2 + 0.8, 0.5]} intensity={0.4} distance={4} color="#f0883e" />

      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.02]}
            onClick={() => near && onApproach(zone)} visible={false}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE: EXPERIENCE
   ═══════════════════════════════════════════════════════════════ */
function ExperienceZone({ zone, characterPos, onApproach }) {
  const [near, setNear] = useState(false);

  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...zone.position).distanceTo(
      new THREE.Vector3(characterPos[0], zone.position[1], characterPos[2])
    );
    setNear(dist < 4);
  });

  return (
    <group position={zone.position} rotation={zone.rotation}>
      <mesh castShadow>
        <boxGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15, FRAME_DEPTH]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#0d1520" />
      </mesh>

      <Html transform position={[0, 0, FRAME_DEPTH / 2 + 0.01]}
            style={{ width: "280px", height: "220px", pointerEvents: "none" }}>
        <div style={{
          width: "280px", height: "220px", padding: "18px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          border: "1px solid rgba(74, 158, 255, 0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fb950" }} />
            <span style={{ fontSize: "9px", color: "#3fb950", letterSpacing: "2px", textTransform: "uppercase" }}>Experience</span>
          </div>
          {[
            { role: "Full-Stack Developer", company: "Freelance", period: "2023 — Present" },
            { role: "Frontend Developer", company: "Tech Startup", period: "2022 — 2023" },
            { role: "Web Developer Intern", company: "Digital Agency", period: "2021 — 2022" },
          ].map((job, i) => (
            <div key={i} style={{
              padding: "8px 0",
              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <p style={{ fontSize: "11px", color: "#e6edf3", margin: "0 0 2px 0", fontWeight: 500 }}>{job.role}</p>
              <p style={{ fontSize: "9px", color: "#8b949e", margin: 0 }}>
                {job.company} <span style={{ color: "#3fb950" }}>·</span> {job.period}
              </p>
            </div>
          ))}
        </div>
      </Html>

      <pointLight position={[0, FRAME_H / 2 + 0.8, 0.5]} intensity={0.4} distance={4} color="#3fb950" />

      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.02]}
            onClick={() => near && onApproach(zone)} visible={false}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE: ABOUT ME
   ═══════════════════════════════════════════════════════════════ */
function AboutZone({ zone, characterPos, onApproach }) {
  const [near, setNear] = useState(false);

  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...zone.position).distanceTo(
      new THREE.Vector3(characterPos[0], zone.position[1], characterPos[2])
    );
    setNear(dist < 4);
  });

  return (
    <group position={zone.position} rotation={zone.rotation}>
      <mesh castShadow>
        <boxGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15, FRAME_DEPTH]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#0d1520" />
      </mesh>

      <Html transform position={[0, 0, FRAME_DEPTH / 2 + 0.01]}
            style={{ width: "280px", height: "220px", pointerEvents: "none" }}>
        <div style={{
          width: "280px", height: "220px", padding: "18px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          border: "1px solid rgba(74, 158, 255, 0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a371f7" }} />
            <span style={{ fontSize: "9px", color: "#a371f7", letterSpacing: "2px", textTransform: "uppercase" }}>About Me</span>
          </div>
          <p style={{ fontSize: "11px", color: "#e6edf3", margin: "0 0 10px 0", fontWeight: 500, fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
            Abderrahman Lyassi
          </p>
          <p style={{ fontSize: "10px", color: "#8b949e", lineHeight: 1.6, margin: "0 0 12px 0" }}>
            Full-Stack Developer passionate about building immersive web experiences,
            clean APIs, and scalable applications. I love turning complex problems
            into elegant, user-friendly solutions.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ fontSize: "9px", color: "#a371f7" }}>📍 Morocco</span>
            <span style={{ fontSize: "9px", color: "#a371f7" }}>💼 Open to work</span>
          </div>
        </div>
      </Html>

      <pointLight position={[0, FRAME_H / 2 + 0.8, 0.5]} intensity={0.4} distance={4} color="#a371f7" />

      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.02]}
            onClick={() => near && onApproach(zone)} visible={false}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE: CONTACT FORM
   ═══════════════════════════════════════════════════════════════ */
function ContactZone({ zone, characterPos, onApproach }) {
  const [near, setNear] = useState(false);

  useFrame(() => {
    if (!characterPos) return;
    const dist = new THREE.Vector3(...zone.position).distanceTo(
      new THREE.Vector3(characterPos[0], zone.position[1], characterPos[2])
    );
    setNear(dist < 4);
  });

  return (
    <group position={zone.position} rotation={zone.rotation}>
      <mesh castShadow>
        <boxGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15, FRAME_DEPTH]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color="#0d1520" />
      </mesh>

      <Html transform position={[0, 0, FRAME_DEPTH / 2 + 0.01]}
            style={{ width: "280px", height: "220px", pointerEvents: "none" }}>
        <div style={{
          width: "280px", height: "220px", padding: "18px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          border: "1px solid rgba(74, 158, 255, 0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f778ba" }} />
            <span style={{ fontSize: "9px", color: "#f778ba", letterSpacing: "2px", textTransform: "uppercase" }}>Contact</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "✉", label: "Email", value: "lyassi.abderrahman@gmail.com" },
              { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/abderrahmanly" },
              { icon: "🐙", label: "GitHub", value: "github.com/abderrahman-png" },
              { icon: "📱", label: "Phone", value: "Available on request" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 10px", borderRadius: "6px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{ fontSize: "12px" }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: "8px", color: "#8b949e", margin: "0 0 1px 0", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</p>
                  <p style={{ fontSize: "10px", color: "#e6edf3", margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Html>

      <pointLight position={[0, FRAME_H / 2 + 0.8, 0.5]} intensity={0.4} distance={4} color="#f778ba" />

      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.02]}
            onClick={() => near && onApproach(zone)} visible={false}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE RENDERER — picks the right component per type
   ═══════════════════════════════════════════════════════════════ */
function ZoneRenderer({ zone, characterPos, onApproach }) {
  const props = { zone, characterPos, onApproach };
  switch (zone.type) {
    case "project": return <ProjectZone {...props} />;
    case "skills": return <SkillsZone {...props} />;
    case "experience": return <ExperienceZone {...props} />;
    case "about": return <AboutZone {...props} />;
    case "contact": return <ContactZone {...props} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHARACTER — Billboard avatar with /myavatar.png
   (Movement logic UNTOUCHED)
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
      {/* Billboard avatar — always faces camera horizontally */}
      <Suspense fallback={<AvatarFallback />}>
        <Billboard lockY={true} position={[0, 0.15, 0]}>
          <AvatarSprite />
        </Billboard>
      </Suspense>
      {/* Shadow on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* Fallback avatar (simple colored capsule) while texture loads */
function AvatarFallback() {
  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
        <meshStandardMaterial color="#4a9eff" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#4a9eff" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* Avatar texture loaded separately so useTexture is inside Suspense */
function AvatarSprite() {
  const texture = useTexture("/myavatar.png");
  return (
    <mesh>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOOR HOTSPOTS (UNTOUCHED)
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
        <meshBasicMaterial color={hovered ? "#4a9eff" : "#2a4060"} transparent opacity={hovered ? 0.5 : 0.25} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.5, 32]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMERA CONTROLLER (UNTOUCHED)
   ═══════════════════════════════════════════════════════════════ */
function CameraController({ characterPos, zoomedArtwork }) {
  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3(0, 2.5, 8));
  const lookTarget = useRef(new THREE.Vector3(0, 2, 0));

  useFrame((_, delta) => {
    if (zoomedArtwork) return;

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
   CUSTOM CURSOR (UNTOUCHED)
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
      border: "1.5px solid rgba(74,158,255,0.7)",
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
   FLOOR CLICK HANDLER (UNTOUCHED)
   ═══════════════════════════════════════════════════════════════ */
function FloorClickPlane({ onFloorClick }) {
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const point = e.point;
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
    { pos: [-8, 0, -4.5], label: "1" },
    { pos: [-3.5, 0, -4.5], label: "2" },
    { pos: [1, 0, -4.5], label: "3" },
    { pos: [5.5, 0, -4.5], label: "4" },
    { pos: [-8, 0, 4.5], label: "5" },
    { pos: [-3.5, 0, 4.5], label: "6" },
    { pos: [1, 0, 4.5], label: "7" },
    { pos: [5.5, 0, 4.5], label: "8" },
    { pos: [-9, 0, -3], label: "9" },
    { pos: [-9, 0, 3], label: "10" },
    { pos: [0, 0, 0], label: "C" },
  ], []);

  const handleFloorClick = useCallback((pos) => {
    if (zoomedArtwork) return;
    setTargetPos(pos);
  }, [zoomedArtwork]);

  return (
    <>
      {/* Dark ambient + cool directional lighting */}
      <ambientLight intensity={0.25} color="#a0b4d0" />
      <directionalLight position={[5, 8, 3]} intensity={0.5} color="#b0c4e8" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15}
        shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 6, -3]} intensity={0.2} color="#8090c0" />

      {/* Ceiling spotlights — cool neon blue tint */}
      {[-6, 0, 6].map((x, i) => (
        <group key={`clight-${i}`}>
          <pointLight position={[x, 4.8, 0]} intensity={0.7} distance={12} color="#6090d0" />
          <mesh position={[x, 4.95, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#1a2040" roughness={0.3} metalness={0.8} emissive="#4a9eff" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      <GalleryRoom />

      {/* Developer Zones */}
      {ZONES.map(zone => (
        <Suspense key={zone.id} fallback={null}>
          <ZoneRenderer zone={zone} characterPos={charPos} onApproach={onZoomArtwork} />
        </Suspense>
      ))}

      {/* Floor hotspots */}
      {!zoomedArtwork && hotspots.map((h, i) => (
        <FloorHotspot key={i} position={h.pos} label={h.label}
                      onClick={handleFloorClick} />
      ))}

      <FloorClickPlane onFloorClick={handleFloorClick} />

      <Character targetPos={targetPos} onPositionUpdate={setCharPos} />

      <CameraController characterPos={charPos} zoomedArtwork={zoomedArtwork} />

      <fog attach="fog" args={["#080a12", 12, 30]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE DETAIL OVERLAY (2D) — replaces ArtworkDetail
   ═══════════════════════════════════════════════════════════════ */
function ZoneDetail({ zone, onClose }) {
  const overlayRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(contentRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 });
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.35, ease: "power2.in", onComplete: onClose });
  };

  const accentColor = {
    project: "#4a9eff", skills: "#f0883e", experience: "#3fb950",
    about: "#a371f7", contact: "#f778ba",
  }[zone.type] || "#4a9eff";

  return (
    <div ref={overlayRef} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(5,5,10,0.95)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      <button onClick={handleClose} style={{
        position: "absolute", top: "2rem", right: "2rem",
        background: "none", border: `1px solid ${accentColor}33`,
        color: "#fff", padding: "10px 24px", borderRadius: "30px",
        fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
        cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.3s",
      }}
      onMouseEnter={(e) => { e.target.style.background = `${accentColor}20`; }}
      onMouseLeave={(e) => { e.target.style.background = "none"; }}>
        Close ×
      </button>

      <div ref={contentRef} style={{
        maxWidth: "600px", width: "100%", padding: "40px",
        background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
        borderRadius: "16px", border: `1px solid ${accentColor}25`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accentColor }} />
          <span style={{ fontSize: "11px", color: accentColor, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            {zone.type}
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          fontWeight: 300, color: "#e6edf3", marginBottom: "1rem",
        }}>
          {zone.title}
        </h2>

        {zone.desc && (
          <p style={{ fontSize: "14px", color: "#8b949e", lineHeight: 1.7, marginBottom: "1.5rem", fontFamily: "'Inter', sans-serif" }}>
            {zone.desc}
          </p>
        )}

        {zone.tech && (
          <div style={{ borderTop: `1px solid ${accentColor}20`, paddingTop: "1rem" }}>
            <p style={{ fontSize: "12px", color: accentColor, letterSpacing: "1px", fontFamily: "'Inter', sans-serif" }}>
              {zone.tech}
            </p>
          </div>
        )}

        {zone.type === "skills" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
            {SKILLS.map(s => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 12px", borderRadius: "6px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: "12px", color: "#c9d1d9" }}>{s.name}</span>
              </div>
            ))}
          </div>
        )}

        {zone.type === "contact" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            {[
              { icon: "✉", label: "Email", value: "lyassi.abderrahman@gmail.com" },
              { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/abderrahmanly" },
              { icon: "🐙", label: "GitHub", value: "github.com/abderrahman-png" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "8px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: "10px", color: "#8b949e", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</p>
                  <p style={{ fontSize: "13px", color: "#e6edf3", margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HUD OVERLAY — Updated for developer portfolio
   ═══════════════════════════════════════════════════════════════ */
function HUD() {
  return (
    <>
      {/* Top left — Name */}
      <div style={{ position: "fixed", top: "1.5rem", left: "2rem", zIndex: 50, pointerEvents: "none" }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.3rem", fontWeight: 300,
          letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff",
        }}>
          Abderrahman <span style={{ color: "#4a9eff" }}>Lyassi</span>
        </h1>
      </div>

      {/* Top right — Portfolio label */}
      <div style={{ position: "fixed", top: "1.5rem", right: "2rem", zIndex: 50, pointerEvents: "none" }}>
        <p style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(74,158,255,0.5)", fontFamily: "'Inter', sans-serif",
        }}>
          Developer Portfolio
        </p>
      </div>

      {/* Bottom left — Breadcrumb */}
      <div style={{
        position: "fixed", bottom: "1.5rem", left: "2rem", zIndex: 50,
        display: "flex", gap: "8px", alignItems: "center", pointerEvents: "none",
      }}>
        {["Home", "Portfolio"].map((item, i) => (
          <span key={item} style={{
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: i === 1 ? "rgba(74,158,255,0.5)" : "rgba(255,255,255,0.25)",
            fontFamily: "'Inter', sans-serif",
          }}>
            {item}{i < 1 && <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.15)" }}>&gt;</span>}
          </span>
        ))}
      </div>

      {/* Bottom right — Controls */}
      <div style={{ position: "fixed", bottom: "1.5rem", right: "2rem", zIndex: 50, pointerEvents: "none" }}>
        <p style={{
          fontSize: "10px", letterSpacing: "2px",
          color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif",
        }}>
          WASD / Arrows to move · Shift to sprint · Approach zones to interact
        </p>
      </div>

      {/* Bottom center — Socials */}
      <div style={{
        position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 50, display: "flex", gap: "24px", alignItems: "center",
      }}>
        <a href="https://github.com/abderrahman-png" target="_blank" rel="noreferrer"
           style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.3s" }}
           onMouseEnter={(e) => e.target.style.color = "#4a9eff"}
           onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
          GitHub
        </a>
        <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
        <a href="https://linkedin.com/in/abderrahmanly" target="_blank" rel="noreferrer"
           style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.3s" }}
           onMouseEnter={(e) => e.target.style.color = "#4a9eff"}
           onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
          LinkedIn
        </a>
        <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
        <a href="mailto:lyassi.abderrahman@gmail.com"
           style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.3s" }}
           onMouseEnter={(e) => e.target.style.color = "#4a9eff"}
           onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
          Contact
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN — Updated branding
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
      background: "#080a12",
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
        Abderrahman <span style={{ color: "#4a9eff" }}>Lyassi</span>
      </h1>
      <div style={{
        width: "200px", height: "1px",
        background: "rgba(74,158,255,0.15)",
        borderRadius: "1px", overflow: "hidden",
      }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`, height: "100%",
          background: "#4a9eff",
          transition: "width 0.3s ease",
        }} />
      </div>
      <p style={{
        marginTop: "1rem", fontSize: "10px",
        letterSpacing: "3px", color: "rgba(74,158,255,0.4)",
        fontFamily: "'Inter', sans-serif",
      }}>
        Loading portfolio...
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function Gallery3D() {
  const [zoomedZone, setZoomedZone] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#080a12" }}>
      <LoadingScreen />
      <CustomCursor />
      <HUD />

      <Canvas
        shadows
        camera={{ position: [0, 3.2, 9], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene onZoomArtwork={setZoomedZone} zoomedArtwork={zoomedZone} />
        </Suspense>
      </Canvas>

      {zoomedZone && (
        <ZoneDetail zone={zoomedZone} onClose={() => setZoomedZone(null)} />
      )}
    </div>
  );
}
