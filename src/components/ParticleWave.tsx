"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleWave: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const pointsRef = useRef<THREE.Points | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let animationId: number;
        let renderer: THREE.WebGLRenderer;
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let geometry: THREE.BufferGeometry;
        let material: THREE.ShaderMaterial;

        const onWindowResize = () => {
            if (!containerRef.current || !renderer || !camera) return;
            const width = containerRef.current.clientWidth || window.innerWidth;
            const height = containerRef.current.clientHeight || window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const animate = (t: number) => {
            animationId = requestAnimationFrame(animate);
            if (pointsRef.current) {
                (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = t * 0.001 * 0.5;
            }
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };

        const init = () => {
            if (!containerRef.current) return;

            scene = new THREE.Scene();
            const containerWidth = containerRef.current.clientWidth || window.innerWidth;
            const containerHeight = containerRef.current.clientHeight || window.innerHeight;

            camera = new THREE.PerspectiveCamera(
                75,
                containerWidth / containerHeight,
                1,
                10000
            );
            camera.position.z = 1000;
            camera.position.y = 400;
            camera.rotation.x = -Math.PI / 10;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(containerWidth, containerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const PARTICLE_COUNT = 15000;
            const GRID_SIZE = 125;

            geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(PARTICLE_COUNT * 3);
            const opacities = new Float32Array(PARTICLE_COUNT);

            let i = 0;
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let z = 0; z < GRID_SIZE; z++) {
                    if (i < PARTICLE_COUNT) {
                        positions[i * 3] = (x - GRID_SIZE / 2) * 50;
                        positions[i * 3 + 1] = 0;
                        positions[i * 3 + 2] = (z - GRID_SIZE / 2) * 50;
                        opacities[i] = Math.random();
                        i++;
                    }
                }
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

            material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    color: { value: new THREE.Color(0xffffff) },
                },
                vertexShader: `
                    uniform float time;
                    attribute float opacity;
                    varying float vOpacity;
                    varying float vY;
                    void main() {
                      vOpacity = opacity;
                      vec3 pos = position;
                      pos.y += sin(pos.x * 0.002 + time) * 150.0;
                      pos.y += cos(pos.z * 0.002 + time) * 150.0;
                      vY = pos.y;
                      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                      gl_PointSize = 4.5 * (1000.0 / -mvPosition.z);
                      gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    varying float vOpacity;
                    varying float vY;
                    void main() {
                      float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
                      if (dist > 0.5) discard;
                      
                      float illumination = smoothstep(-150.0, 150.0, vY);
                      float alpha = smoothstep(0.5, 0.0, dist) * vOpacity * (0.6 + illumination * 0.4);
                      
                      gl_FragColor = vec4(color, alpha * 0.9);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const particles = new THREE.Points(geometry, material);
            scene.add(particles);
            pointsRef.current = particles;

            window.addEventListener('resize', onWindowResize);
            animationId = requestAnimationFrame(animate);
        };

        // Delay initialization slightly to ensure container is ready and layout has settled
        const timer = setTimeout(init, 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', onWindowResize);
            if (animationId) cancelAnimationFrame(animationId);
            if (containerRef.current && renderer?.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            if (geometry) geometry.dispose();
            if (material) material.dispose();
            if (renderer) renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
};

export default ParticleWave;
