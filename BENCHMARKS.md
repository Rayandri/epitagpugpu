# Benchmarks IRGPU - Version Baseline

**Date** : 17 décembre 2025 à 21:41  
**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

## Résultats

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 6.26 | **2.10x** |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 1.41x |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | 1.18x |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 1.11x |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | 1.24x |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 1.08x |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 1.15x |

**Speedup moyen** : ~1.32x

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

