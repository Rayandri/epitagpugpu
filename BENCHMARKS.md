# Benchmarks IRGPU

**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

Fichiers détaillés dans `/benchmarks/`

---

## Résumé des versions

| Version | Description | Speedup moyen vs CPU |
|---------|-------------|---------------------|
| v1.0 | Baseline (hystérésis CPU) | 1.32x |
| v1.1 | Hystérésis full GPU | **8.5x** |
| v1.2 | Sans cudaDeviceSynchronize() | ~8.5x |

---

## v1.0 - Baseline

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 6.26 | 2.10x |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 1.41x |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | 1.18x |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 1.11x |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | 1.24x |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 1.08x |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 1.15x |

**Speedup moyen CPU→GPU v1.0** : 1.32x

---

## v1.1 - Hystérésis GPU

| Vidéo | CPU (s) | GPU v1.1 (s) | Speedup vs CPU | Gain vs v1.0 |
|-------|---------|--------------|----------------|--------------|
| ACET.mp4 | 13.19 | 5.24 | **2.5x** | 1.2x |
| lil_clown_studio.mp4 | 40.62 | 9.49 | **4.3x** | 3.0x |
| 1023-142621257_large.mp4 | 72.27 | 9.52 | **7.6x** | 6.4x |
| 27999-366978301_large.mp4 | 37.60 | 7.37 | **5.1x** | 4.6x |
| 3630-172488409_large.mp4 | 64.26 | 11.09 | **5.8x** | 4.7x |
| 6387-191695740_large.mp4 | 69.01 | 8.78 | **7.9x** | 7.3x |
| 20895-313083562_large.mp4 | 164.57 | 23.21 | **7.1x** | 6.1x |

**Speedup moyen CPU→GPU v1.1** : **5.8x**

---

## v1.2 - Sans cudaDeviceSynchronize()

| Vidéo | CPU (s) | GPU v1.2 (s) | Speedup vs CPU |
|-------|---------|--------------|----------------|
| ACET.mp4 | 13.19 | 5.23 | **2.5x** |
| lil_clown_studio.mp4 | 40.62 | 10.09 | **4.0x** |
| 1023-142621257_large.mp4 | 72.27 | 12.21 | **5.9x** |
| 27999-366978301_large.mp4 | 37.60 | 5.43 | **6.9x** |
| 3630-172488409_large.mp4 | 64.26 | 10.94 | **5.9x** |
| 6387-191695740_large.mp4 | 69.01 | 10.85 | **6.4x** |
| 20895-313083562_large.mp4 | 164.57 | 21.66 | **7.6x** |

**Speedup moyen CPU→GPU v1.2** : **5.6x**

---

## Analyse des bottlenecks

### Optimisations appliquées
- [x] **v1.1** : Hystérésis full GPU (kernel itératif + flag atomique)
- [x] **v1.2** : Suppression cudaDeviceSynchronize() inutiles

### Optimisations restantes
- [ ] **v1.3** : Shared memory pour érosion/dilatation
- [ ] **v1.4** : Fusion de kernels (motion_mask + threshold)
- [ ] **v1.5** : CUDA streams pour overlapping
