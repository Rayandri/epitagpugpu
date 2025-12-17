# Benchmarks IRGPU

**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

---

## v1.0 - Baseline (17 déc 2025 à 21:41)

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 6.26 | 2.10x |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 1.41x |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | 1.18x |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 1.11x |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | 1.24x |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 1.08x |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 1.15x |

**Speedup moyen CPU→GPU** : ~1.32x

---

## v1.1 - Hystérésis GPU (17 déc 2025 à 22:04)

| Vidéo | v1.0 GPU | v1.1 GPU | Gain |
|-------|----------|----------|------|
| ACET.mp4 | 6.26 | 5.24 | 1.2x |
| lil_clown_studio.mp4 | 28.70 | 9.49 | **3.0x** |
| 1023-142621257_large.mp4 | 61.09 | 9.52 | **6.4x** |
| 27999-366978301_large.mp4 | 33.62 | 7.37 | **4.6x** |
| 3630-172488409_large.mp4 | 51.81 | 11.09 | **4.7x** |
| 6387-191695740_large.mp4 | 63.80 | 8.78 | **7.3x** |
| 20895-313083562_large.mp4 | 142.12 | 23.21 | **6.1x** |

**Gain moyen v1.0→v1.1** : ~4.7x (optimisation hystérésis GPU)

## Analyse

### Bottlenecks identifiés
1. **Hystérésis sur CPU** (lignes 463-529 de Compute.cu) - transferts GPU→CPU→GPU
2. **cudaDeviceSynchronize()** après chaque kernel - empêche le pipelining
3. **Transferts Host↔Device** à chaque frame
4. **Pas de shared memory** pour la morphologie

### Kernels GPU implémentés
- `init_curand_kernel` - Initialisation RNG
- `background_estimation_kernel` - Weighted Reservoir Sampling
- `motion_mask_kernel` - Différence RGB
- `erosion_kernel` - Min voisinage (disque)
- `dilation_kernel` - Max voisinage (disque)
- `visualization_kernel` - Overlay rouge

### Pistes d'optimisation
- [ ] Hystérésis full GPU avec kernel itératif + flag atomique
- [ ] Shared memory pour érosion/dilatation
- [ ] CUDA streams pour overlapper compute et transferts
- [ ] Double buffering pour réduire la latence

