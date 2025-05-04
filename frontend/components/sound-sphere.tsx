"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"

interface SoundSphereProps {
  isPlaying: boolean
  isRecording?: boolean
  isGenerating?: boolean
  text: string
  audioData?: number[]
}

export default function SoundSphere({
  isPlaying,
  isRecording = false,
  isGenerating = false,
  text,
  audioData = [],
}: SoundSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const timeRef = useRef<number>(0)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2.5
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(300, 300)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create energy sphere
    const createEnergySphere = () => {
      // Create base sphere geometry
      const geometry = new THREE.SphereGeometry(1, 32, 32)

      // Create material with custom shader for the energy effect
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0xff00ff) }, // Pink
          color2: { value: new THREE.Color(0x00ffff) }, // Cyan
          color3: { value: new THREE.Color(0x9900ff) }, // Purple
          intensity: { value: 1.0 },
          audioData: { value: new Float32Array(128).fill(0) },
          isRecording: { value: 0 },
          isPlaying: { value: 0 },
          isGenerating: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform float intensity;
          uniform float isRecording;
          uniform float isPlaying;
          uniform float isGenerating;
          uniform float audioData[128];
          
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          // Noise functions
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          
          float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            
            vec2 u = f * f * (3.0 - 2.0 * f);
            
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }
          
          float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 0.0;
            
            for (int i = 0; i < 5; i++) {
              value += amplitude * noise(st);
              st *= 2.0;
              amplitude *= 0.5;
            }
            
            return value;
          }
          
          void main() {
            // Get audio data influence
            float audioInfluence = 0.0;
            int audioIndex = int(vUv.x * 128.0);
            audioIndex = clamp(audioIndex, 0, 127);
            audioInfluence = audioData[audioIndex] * 2.0;
            
            // Create energy pattern based on noise
            vec2 st = vUv * 5.0;
            float n1 = fbm(st + time * 0.1);
            float n2 = fbm(st * 1.5 - time * 0.15);
            float n3 = fbm(st * 2.0 + time * 0.2);
            
            // Create rim lighting effect
            float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
            rim = pow(rim, 3.0) * intensity;
            
            // Determine mode-specific effects
            vec3 modeColor = color1;
            float modeEffect = 0.0;
            
            if (isRecording > 0.5) {
              // Red pulsing for recording
              modeColor = vec3(1.0, 0.3, 0.3);
              modeEffect = sin(time * 5.0) * 0.5 + 0.5;
            } else if (isPlaying > 0.5) {
              // Blue-purple for playback
              modeColor = mix(color1, color3, 0.5);
              modeEffect = sin(time * 3.0) * 0.3 + 0.7;
            } else if (isGenerating > 0.5) {
              // Cyan-purple for generating
              modeColor = mix(color2, color3, sin(time * 2.0) * 0.5 + 0.5);
              modeEffect = sin(time * 2.0) * 0.3 + 0.7;
            }
            
            // Mix colors based on noise, rim, and audio
            vec3 color = mix(modeColor, color2, n1 + audioInfluence * 0.3);
            color = mix(color, color3, n2 * rim + audioInfluence * 0.2);
            
            // Add glow and energy lines
            float energyLines = pow(sin(n3 * 10.0 + time + audioInfluence * 5.0) * 0.5 + 0.5, 5.0) * rim;
            color += vec3(0.5, 0.8, 1.0) * energyLines * (1.0 + audioInfluence);
            
            // Apply audio-reactive effects
            color += vec3(audioInfluence * 0.3, audioInfluence * 0.2, audioInfluence * 0.5);
            
            // Apply opacity based on rim and noise
            float alpha = rim * 0.7 + n1 * 0.3 + audioInfluence * 0.2;
            alpha = min(alpha + energyLines + modeEffect * 0.3, 1.0);
            
            gl_FragColor = vec4(color, alpha * intensity);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      })

      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)
      sphereRef.current = sphere

      // Add outer glow particles
      const particlesGeometry = new THREE.BufferGeometry()
      const particleCount = 1000
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)

      const color1 = new THREE.Color(0xff00ff) // Pink
      const color2 = new THREE.Color(0x00ffff) // Cyan
      const color3 = new THREE.Color(0x9900ff) // Purple

      for (let i = 0; i < particleCount; i++) {
        // Create particles in a spherical distribution
        const radius = 1.0 + Math.random() * 0.5 // Slightly outside the main sphere
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)

        // Assign random colors from our palette
        const colorChoice = Math.floor(Math.random() * 3)
        let color
        if (colorChoice === 0) color = color1
        else if (colorChoice === 1) color = color2
        else color = color3

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b

        // Random sizes for particles
        sizes[i] = Math.random() * 0.05 + 0.01
      }

      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
      particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

      const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pointTexture: { value: new THREE.TextureLoader().load("/particle.png") },
          audioData: { value: new Float32Array(128).fill(0) },
          isRecording: { value: 0 },
          isPlaying: { value: 0 },
          isGenerating: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          uniform float audioData[128];
          uniform float isRecording;
          uniform float isPlaying;
          uniform float isGenerating;
          
          void main() {
            vColor = color;
            
            // Get audio data for this vertex
            int audioIndex = int(position.x * 10.0 + position.y * 10.0 + position.z * 10.0) % 128;
            audioIndex = abs(audioIndex);
            float audioValue = audioData[audioIndex] * 2.0;
            
            // Animate particles
            vec3 pos = position;
            float noise = sin(position.x * 5.0 + time) * cos(position.y * 5.0 + time) * sin(position.z * 5.0 + time) * 0.1;
            
            // Add audio reactivity
            noise += audioValue * 0.2;
            
            // Different animation based on mode
            if (isRecording > 0.5) {
              // More aggressive movement for recording
              noise *= 1.5;
              pos += normal * (noise + sin(time * 10.0) * 0.05);
            } else if (isPlaying > 0.5) {
              // Smoother movement for playback
              pos += normal * (noise + sin(time * 3.0) * 0.1);
            } else if (isGenerating > 0.5) {
              // Pulsing movement for generating
              pos += normal * (noise + sin(time * 2.0) * 0.15);
            } else {
              pos += normal * noise;
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // Size variation based on audio
            float dynamicSize = size * (1.0 + audioValue * 0.5);
            
            gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          
          void main() {
            gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
          }
        `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })

      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particles)
      particlesRef.current = particles
    }

    createEnergySphere()

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)
      timeRef.current += 0.01

      if (sphereRef.current) {
        // Update shader uniforms
        const material = sphereRef.current.material as THREE.ShaderMaterial
        material.uniforms.time.value = timeRef.current

        // Update mode flags
        material.uniforms.isRecording.value = isRecording ? 1.0 : 0.0
        material.uniforms.isPlaying.value = isPlaying ? 1.0 : 0.0
        material.uniforms.isGenerating.value = isGenerating ? 1.0 : 0.0

        // Update audio data if available
        if (audioData && audioData.length > 0) {
          // Create a Float32Array of the right size (128)
          const audioDataArray = new Float32Array(128)

          // Fill with actual data or zeros
          for (let i = 0; i < 128; i++) {
            audioDataArray[i] = i < audioData.length ? audioData[i] : 0
          }

          material.uniforms.audioData.value = audioDataArray
        }

        // Adjust intensity based on state
        if (isRecording) {
          material.uniforms.intensity.value = 1.2 + 0.3 * Math.sin(timeRef.current * 5)
        } else if (isPlaying) {
          material.uniforms.intensity.value = 1.0 + 0.2 * Math.sin(timeRef.current * 3)
        } else if (isGenerating) {
          material.uniforms.intensity.value = 0.8 + 0.3 * Math.sin(timeRef.current * 2)
        } else {
          material.uniforms.intensity.value = 0.5
        }

        // Rotate sphere - different speeds based on state
        if (isRecording) {
          sphereRef.current.rotation.y += 0.01
          sphereRef.current.rotation.x += 0.005
        } else if (isPlaying) {
          sphereRef.current.rotation.y += 0.007
          sphereRef.current.rotation.x += 0.003
        } else {
          sphereRef.current.rotation.y += 0.003
          sphereRef.current.rotation.x += 0.001
        }
      }

      // Animate particles
      if (particlesRef.current) {
        const material = particlesRef.current.material as THREE.ShaderMaterial
        material.uniforms.time.value = timeRef.current

        // Update mode flags
        material.uniforms.isRecording.value = isRecording ? 1.0 : 0.0
        material.uniforms.isPlaying.value = isPlaying ? 1.0 : 0.0
        material.uniforms.isGenerating.value = isGenerating ? 1.0 : 0.0

        // Update audio data if available
        if (audioData && audioData.length > 0) {
          // Create a Float32Array of the right size (128)
          const audioDataArray = new Float32Array(128)

          // Fill with actual data or zeros
          for (let i = 0; i < 128; i++) {
            audioDataArray[i] = i < audioData.length ? audioData[i] : 0
          }

          material.uniforms.audioData.value = audioDataArray
        }

        // Rotate particles in opposite direction - different speeds based on state
        if (isRecording) {
          particlesRef.current.rotation.y -= 0.005
          particlesRef.current.rotation.x -= 0.002
        } else if (isPlaying) {
          particlesRef.current.rotation.y -= 0.003
          particlesRef.current.rotation.x -= 0.001
        } else {
          particlesRef.current.rotation.y -= 0.001
          particlesRef.current.rotation.x -= 0.0005
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    // Cleanup
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Update animation based on state changes
  useEffect(() => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.ShaderMaterial

      material.uniforms.isRecording.value = isRecording ? 1.0 : 0.0
      material.uniforms.isPlaying.value = isPlaying ? 1.0 : 0.0
      material.uniforms.isGenerating.value = isGenerating ? 1.0 : 0.0
    }

    if (particlesRef.current) {
      const material = particlesRef.current.material as THREE.ShaderMaterial

      material.uniforms.isRecording.value = isRecording ? 1.0 : 0.0
      material.uniforms.isPlaying.value = isPlaying ? 1.0 : 0.0
      material.uniforms.isGenerating.value = isGenerating ? 1.0 : 0.0
    }
  }, [isRecording, isPlaying, isGenerating])

  // Update audio data when it changes
  useEffect(() => {
    if (sphereRef.current && audioData && audioData.length > 0) {
      const material = sphereRef.current.material as THREE.ShaderMaterial

      // Create a Float32Array of the right size (128)
      const audioDataArray = new Float32Array(128)

      // Fill with actual data or zeros
      for (let i = 0; i < 128; i++) {
        audioDataArray[i] = i < audioData.length ? audioData[i] : 0
      }

      material.uniforms.audioData.value = audioDataArray
    }

    if (particlesRef.current && audioData && audioData.length > 0) {
      const material = particlesRef.current.material as THREE.ShaderMaterial

      // Create a Float32Array of the right size (128)
      const audioDataArray = new Float32Array(128)

      // Fill with actual data or zeros
      for (let i = 0; i < 128; i++) {
        audioDataArray[i] = i < audioData.length ? audioData[i] : 0
      }

      material.uniforms.audioData.value = audioDataArray
    }
  }, [audioData])

  return (
    <motion.div
      ref={containerRef}
      className="w-[300px] h-[300px] relative"
      animate={{
        scale: isPlaying ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 2,
        repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
        ease: "easeInOut",
      }}
    >
      {/* Text overlay that shows current speech */}
      {text && (
        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 text-center w-full max-w-[400px]">
          <p className="text-xs text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </p>
        </div>
      )}
    </motion.div>
  )
}
