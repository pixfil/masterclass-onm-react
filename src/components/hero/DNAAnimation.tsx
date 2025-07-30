'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface DNAAnimationProps {
  className?: string
}

export const DNAAnimation: React.FC<DNAAnimationProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    rendererRef.current = renderer
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0) // Transparent background
    mountRef.current.appendChild(renderer.domElement)

    // DNA Helix Parameters
    const helixRadius = 2
    const helixHeight = 8
    const turns = 3
    const particlesPerTurn = 20
    const totalParticles = turns * particlesPerTurn * 2 // Two strands

    // Create DNA particles
    const geometry = new THREE.SphereGeometry(0.08, 8, 8)
    const material1 = new THREE.MeshBasicMaterial({ 
      color: 0x00a8ff, // Blue cyan
      transparent: true,
      opacity: 0.8
    })
    const material2 = new THREE.MeshBasicMaterial({ 
      color: 0x0078d4, // Deep blue  
      transparent: true,
      opacity: 0.8
    })

    const particles: THREE.Mesh[] = []
    const connections: THREE.Line[] = []

    // Create DNA strands
    for (let i = 0; i < totalParticles / 2; i++) {
      const angle = (i / (totalParticles / 2)) * Math.PI * 2 * turns
      const y = (i / (totalParticles / 2)) * helixHeight - helixHeight / 2
      
      // First strand
      const particle1 = new THREE.Mesh(geometry, material1)
      particle1.position.set(
        Math.cos(angle) * helixRadius,
        y,
        Math.sin(angle) * helixRadius
      )
      scene.add(particle1)
      particles.push(particle1)
      
      // Second strand (opposite)
      const particle2 = new THREE.Mesh(geometry, material2)
      particle2.position.set(
        Math.cos(angle + Math.PI) * helixRadius,
        y,
        Math.sin(angle + Math.PI) * helixRadius
      )
      scene.add(particle2)
      particles.push(particle2)

      // Create connections between strands (base pairs)
      if (i % 4 === 0) { // Less frequent connections for cleaner look
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
          particle1.position,
          particle2.position
        ])
        const connectionMaterial = new THREE.LineBasicMaterial({ 
          color: 0x40a9ff,
          transparent: true,
          opacity: 0.3
        })
        const connection = new THREE.Line(connectionGeometry, connectionMaterial)
        scene.add(connection)
        connections.push(connection)
      }
    }

    // Add floating particles around the DNA
    const floatingParticles: THREE.Mesh[] = []
    const floatingGeometry = new THREE.SphereGeometry(0.02, 6, 6)
    const floatingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4
    })

    for (let i = 0; i < 100; i++) {
      const particle = new THREE.Mesh(floatingGeometry, floatingMaterial)
      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20
      )
      scene.add(particle)
      floatingParticles.push(particle)
    }

    // Camera position
    camera.position.set(8, 2, 8)
    camera.lookAt(0, 0, 0)

    // Animation loop
    let time = 0
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      time += 0.01

      // Rotate the entire DNA helix
      particles.forEach((particle, index) => {
        const originalY = particle.position.y
        particle.rotation.y = time
        
        // Add subtle floating motion
        particle.position.y = originalY + Math.sin(time * 2 + index * 0.1) * 0.1
      })

      // Update connections
      connections.forEach((connection, index) => {
        const particle1 = particles[index * 8] // Adjust index for connection frequency
        const particle2 = particles[index * 8 + 1]
        if (particle1 && particle2) {
          const points = [particle1.position, particle2.position]
          connection.geometry.setFromPoints(points)
        }
      })

      // Animate floating particles
      floatingParticles.forEach((particle, index) => {
        particle.position.x += Math.sin(time + index) * 0.002
        particle.position.y += Math.cos(time + index * 0.5) * 0.001
        particle.position.z += Math.sin(time + index * 0.3) * 0.002
        
        // Keep particles within bounds
        if (Math.abs(particle.position.x) > 10) particle.position.x *= -0.8
        if (Math.abs(particle.position.y) > 8) particle.position.y *= -0.8
        if (Math.abs(particle.position.z) > 10) particle.position.z *= -0.8
      })

      // Smooth camera rotation
      camera.position.x = Math.cos(time * 0.2) * 10
      camera.position.z = Math.sin(time * 0.2) * 10
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js resources
      particles.forEach(particle => {
        particle.geometry.dispose()
        if (Array.isArray(particle.material)) {
          particle.material.forEach(mat => mat.dispose())
        } else {
          particle.material.dispose()
        }
      })
      
      connections.forEach(connection => {
        connection.geometry.dispose()
        if (Array.isArray(connection.material)) {
          connection.material.forEach(mat => mat.dispose())
        } else {
          connection.material.dispose()
        }
      })
      
      floatingParticles.forEach(particle => {
        particle.geometry.dispose()
        if (Array.isArray(particle.material)) {
          particle.material.forEach(mat => mat.dispose())
        } else {
          particle.material.dispose()
        }
      })
      
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}

export default DNAAnimation