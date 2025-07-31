'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const JawAnimation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const frameId = useRef<number>()
  const nervesRef = useRef<THREE.Points[]>([])
  const connectionsRef = useRef<THREE.Line[]>([])

  // Création du contour du visage et du système nerveux
  const createFaceNerveSystem = useMemo(() => {
    return () => {
      const faceGroup = new THREE.Group()
      
      // Contour du visage (profil)
      const facePoints = []
      const faceShape = new THREE.Shape()
      
      // Créer un profil de visage simplifié
      faceShape.moveTo(0, 3)  // Haut du crâne
      faceShape.bezierCurveTo(1.5, 2.8, 2, 2, 2.2, 1)  // Front
      faceShape.bezierCurveTo(2.3, 0.5, 2.2, 0, 2, -0.5)  // Nez
      faceShape.bezierCurveTo(1.8, -0.8, 1.5, -1, 1.2, -1.2)  // Lèvre supérieure
      faceShape.bezierCurveTo(1, -1.3, 0.8, -1.4, 1, -1.6)  // Bouche
      faceShape.bezierCurveTo(1.2, -1.8, 1.5, -2, 1.8, -2.3)  // Menton
      faceShape.bezierCurveTo(1.5, -2.8, 0.8, -3, 0, -3.2)  // Mâchoire
      faceShape.bezierCurveTo(-0.5, -3, -0.8, -2.5, -1, -2)  // Cou
      
      // Créer une géométrie de ligne pour le contour
      const points = faceShape.getPoints(50)
      const faceGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const faceMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4F46E5, 
        opacity: 0.3,
        transparent: true
      })
      const faceOutline = new THREE.Line(faceGeometry, faceMaterial)
      faceGroup.add(faceOutline)
      
      // Points nerveux principaux (nœuds du réseau)
      const nerveNodes = [
        // Nerf trijumeau (V)
        { pos: new THREE.Vector3(0.5, 0.5, 0), color: 0x4F46E5, size: 0.15 },
        { pos: new THREE.Vector3(1.2, 0.3, 0), color: 0x4F46E5, size: 0.1 },
        { pos: new THREE.Vector3(1.5, -0.2, 0), color: 0x4F46E5, size: 0.1 },
        { pos: new THREE.Vector3(1.3, -0.8, 0), color: 0x4F46E5, size: 0.1 },
        
        // Nerf facial (VII)
        { pos: new THREE.Vector3(0.3, -0.5, 0), color: 0x06B6D4, size: 0.15 },
        { pos: new THREE.Vector3(0.8, -0.7, 0), color: 0x06B6D4, size: 0.1 },
        { pos: new THREE.Vector3(1.1, -1.1, 0), color: 0x06B6D4, size: 0.1 },
        { pos: new THREE.Vector3(1.4, -1.5, 0), color: 0x06B6D4, size: 0.1 },
        
        // Points musculaires masséter
        { pos: new THREE.Vector3(0.7, -1.8, 0), color: 0x8B5CF6, size: 0.12 },
        { pos: new THREE.Vector3(1.2, -2.0, 0), color: 0x8B5CF6, size: 0.12 },
        { pos: new THREE.Vector3(0.4, -2.2, 0), color: 0x8B5CF6, size: 0.12 },
        
        // Points temporaux
        { pos: new THREE.Vector3(0.2, 1.5, 0), color: 0x10B981, size: 0.1 },
        { pos: new THREE.Vector3(0.8, 1.3, 0), color: 0x10B981, size: 0.1 },
        { pos: new THREE.Vector3(1.3, 1.0, 0), color: 0x10B981, size: 0.1 }
      ]
      
      // Créer les sphères pour les nœuds nerveux
      nerveNodes.forEach(node => {
        const sphereGeometry = new THREE.SphereGeometry(node.size, 16, 16)
        const sphereMaterial = new THREE.MeshPhongMaterial({
          color: node.color,
          emissive: node.color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8
        })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphere.position.copy(node.pos)
        faceGroup.add(sphere)
      })
      
      return { faceGroup, nerveNodes }
    }
  }, [])

  // Création des connexions nerveuses animées
  const createNerveConnections = useMemo(() => {
    return (nodes: any[]) => {
      const connections = []
      
      // Connexions du nerf trijumeau
      const trigeminalConnections = [
        [0, 1], [1, 2], [2, 3], [0, 2]
      ]
      
      // Connexions du nerf facial
      const facialConnections = [
        [4, 5], [5, 6], [6, 7], [4, 6]
      ]
      
      // Connexions musculaires
      const muscleConnections = [
        [8, 9], [9, 10], [10, 8], [3, 8], [7, 9]
      ]
      
      // Connexions temporales
      const temporalConnections = [
        [11, 12], [12, 13], [11, 13], [0, 11]
      ]
      
      const allConnections = [
        ...trigeminalConnections,
        ...facialConnections,
        ...muscleConnections,
        ...temporalConnections
      ]
      
      allConnections.forEach(([start, end]) => {
        const points = [
          nodes[start].pos,
          nodes[end].pos
        ]
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({
          color: 0x4F46E5,
          opacity: 0.3,
          transparent: true
        })
        
        const line = new THREE.Line(geometry, material)
        connections.push(line)
      })
      
      return connections
    }
  }, [])
  
  // Création de particules d'impulsions nerveuses
  const createNerveImpulses = useMemo(() => {
    return () => {
      const particlesGeometry = new THREE.BufferGeometry()
      const particleCount = 500
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)
      
      const color1 = new THREE.Color(0x4F46E5) // Indigo
      const color2 = new THREE.Color(0x06B6D4) // Cyan
      const color3 = new THREE.Color(0x8B5CF6) // Violet
      const color4 = new THREE.Color(0x10B981) // Vert
      
      for (let i = 0; i < particleCount; i++) {
        // Position aléatoire autour du visage
        const theta = Math.random() * Math.PI * 2
        const phi = (Math.random() - 0.5) * Math.PI
        const radius = 2 + Math.random() * 3
        
        positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius
        positions[i * 3 + 1] = Math.cos(phi) * radius + (Math.random() - 0.5) * 2
        positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius * 0.3
        
        // Couleurs selon la zone
        const colorMix = Math.random()
        let selectedColor: THREE.Color
        if (colorMix < 0.25) {
          selectedColor = color1
        } else if (colorMix < 0.5) {
          selectedColor = color2
        } else if (colorMix < 0.75) {
          selectedColor = color3
        } else {
          selectedColor = color4
        }
        
        colors[i * 3] = selectedColor.r
        colors[i * 3 + 1] = selectedColor.g
        colors[i * 3 + 2] = selectedColor.b
        
        sizes[i] = Math.random() * 0.05 + 0.02
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })
      
      return new THREE.Points(particlesGeometry, particlesMaterial)
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Configuration de la scène
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)
    
    // Éclairage orthodontique
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const directionalLight1 = new THREE.DirectionalLight(0x4F46E5, 1)
    directionalLight1.position.set(5, 5, 5)
    scene.add(directionalLight1)
    
    const directionalLight2 = new THREE.DirectionalLight(0x06B6D4, 0.8)
    directionalLight2.position.set(-5, -5, 5)
    scene.add(directionalLight2)
    
    const pointLight = new THREE.PointLight(0x8B5CF6, 0.5, 100)
    pointLight.position.set(0, 0, 10)
    scene.add(pointLight)
    
    // Création des éléments
    const { faceGroup, nerveNodes } = createFaceNerveSystem()
    scene.add(faceGroup)
    
    // Créer les connexions nerveuses
    const connections = createNerveConnections(nerveNodes)
    connections.forEach(connection => {
      scene.add(connection)
      connectionsRef.current.push(connection)
    })
    
    // Créer les particules d'impulsions
    const impulses = createNerveImpulses()
    scene.add(impulses)
    
    // Animation
    let time = 0
    const animate = () => {
      frameId.current = requestAnimationFrame(animate)
      time += 0.01
      
      // Rotation douce du visage
      faceGroup.rotation.y = Math.sin(time * 0.2) * 0.3
      faceGroup.rotation.x = Math.sin(time * 0.15) * 0.1
      
      // Animation des connexions nerveuses (pulsations)
      connectionsRef.current.forEach((connection, index) => {
        const material = connection.material as THREE.LineBasicMaterial
        const pulse = Math.sin(time * 2 + index * 0.5) * 0.3 + 0.5
        material.opacity = pulse * 0.4
      })
      
      // Animation des nœuds nerveux (brillance)
      faceGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
          const pulse = Math.sin(time * 3 + index * 0.3) * 0.5 + 0.5
          child.material.emissiveIntensity = pulse * 0.8
        }
      })
      
      // Animation des particules d'impulsions
      const positions = impulses.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // Mouvement fluide des particules
        positions[i] += Math.sin(time * 2 + i) * 0.003
        positions[i + 1] += Math.cos(time * 1.5 + i) * 0.002
        positions[i + 2] += Math.sin(time + i * 0.1) * 0.001
        
        // Réinitialiser les particules qui sortent trop loin
        const distance = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2)
        if (distance > 5) {
          positions[i] *= 0.4
          positions[i + 1] *= 0.4
          positions[i + 2] *= 0.4
        }
      }
      impulses.geometry.attributes.position.needsUpdate = true
      
      // Animation de la caméra
      camera.position.x = Math.sin(time * 0.1) * 1.5
      camera.position.y = Math.cos(time * 0.08) * 0.5
      camera.position.z = 6 + Math.sin(time * 0.12) * 0.5
      camera.lookAt(0, 0, 0)
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Gestion du redimensionnement
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [createFaceNerveSystem, createNerveConnections, createNerveImpulses])

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}

export default JawAnimation