# Benchmarks IRGPU

**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

Fichiers détaillés dans `/benchmarks/`

---

## Résumé des versions

| Version | Description | Speedup moyen vs CPU |
|---------|-------------|---------------------|
| v1.0 | Baseline (hystérésis CPU) | 1.3x |
| v1.1 | Hystérésis full GPU | **5.8x** |
| v1.2 | Sans cudaDeviceSynchronize() | 5.6x |
| v1.3 | Shared memory morphologie | 5.7x |
| v1.4 | Fusion dilation + threshold | **5.6x** |

---

## v1.0 - Baseline

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 6.26 | 2.1x |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 1.4x |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | 1.2x |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 1.1x |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | 1.2x |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 1.1x |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 1.2x |

**Speedup moyen** : 1.3x

---

## v1.1 - Hystérésis GPU

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 5.24 | 2.5x |
| lil_clown_studio.mp4 | 40.62 | 9.49 | 4.3x |
| 1023-142621257_large.mp4 | 72.27 | 9.52 | **7.6x** |
| 27999-366978301_large.mp4 | 37.60 | 7.37 | 5.1x |
| 3630-172488409_large.mp4 | 64.26 | 11.09 | 5.8x |
| 6387-191695740_large.mp4 | 69.01 | 8.78 | **7.9x** |
| 20895-313083562_large.mp4 | 164.57 | 23.21 | 7.1x |

**Speedup moyen** : **5.8x**

---

## v1.4 - Version finale (Shared mem + Fusion)

| Vidéo | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 6.41 | 2.1x |
| lil_clown_studio.mp4 | 40.62 | 9.36 | 4.3x |
| 1023-142621257_large.mp4 | 72.27 | 10.05 | 7.2x |
| 27999-366978301_large.mp4 | 37.60 | 7.76 | 4.8x |
| 3630-172488409_large.mp4 | 64.26 | 11.37 | 5.7x |
| 6387-191695740_large.mp4 | 69.01 | 8.12 | **8.5x** |
| 20895-313083562_large.mp4 | 164.57 | 23.20 | 7.1x |

**Speedup moyen** : **5.6x**

---

## Optimisations appliquées

| Version | Optimisation | Impact |
|---------|--------------|--------|
| v1.1 | Hystérésis full GPU (kernel itératif + flag atomique) | **+340%** |
| v1.2 | Suppression cudaDeviceSynchronize() inutiles | ~0% |
| v1.3 | Shared memory pour érosion/dilatation | ~0% |
| v1.4 | Fusion kernel dilation + threshold | ~0% |

**Conclusion** : L'optimisation majeure était l'hystérésis GPU (v1.1). Les autres optimisations (v1.2-v1.4) n'apportent pas de gain significatif car le bottleneck est ailleurs (transferts Host↔Device, bande passante mémoire).
