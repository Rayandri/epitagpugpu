# Benchmarks IRGPU

**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

Fichiers détaillés dans `/benchmarks/`

---

## Tableau comparatif complet

| Vidéo | CPU | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | Meilleur |
|-------|-----|------|------|------|------|------|----------|
| ACET.mp4 | 13.19 | 6.26 | **5.24** | 5.23 | 6.26 | 6.41 | **v1.2** |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 9.49 | 10.09 | 10.31 | **9.36** | **v1.4** |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | 9.52 | 12.21 | **9.37** | 10.05 | **v1.3** |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 7.37 | **5.43** | 7.36 | 7.76 | **v1.2** |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | **11.09** | 10.94 | 11.16 | 11.37 | **v1.2** |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 8.78 | 10.85 | 8.46 | **8.12** | **v1.4** |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 23.21 | **21.66** | 23.05 | 23.20 | **v1.2** |

---

## Speedup vs CPU

| Vidéo | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 |
|-------|------|------|------|------|------|
| ACET.mp4 | 2.1x | **2.5x** | **2.5x** | 2.1x | 2.1x |
| lil_clown_studio.mp4 | 1.4x | 4.3x | 4.0x | 3.9x | **4.3x** |
| 1023-142621257_large.mp4 | 1.2x | 7.6x | 5.9x | **7.7x** | 7.2x |
| 27999-366978301_large.mp4 | 1.1x | 5.1x | **6.9x** | 5.1x | 4.8x |
| 3630-172488409_large.mp4 | 1.2x | **5.8x** | 5.9x | 5.8x | 5.7x |
| 6387-191695740_large.mp4 | 1.1x | 7.9x | 6.4x | 8.2x | **8.5x** |
| 20895-313083562_large.mp4 | 1.2x | 7.1x | **7.6x** | 7.1x | 7.1x |
| **Moyenne** | **1.3x** | **5.8x** | **5.6x** | **5.7x** | **5.6x** |

---

## Évolution par version

| Version | Description | Speedup moyen | Delta |
|---------|-------------|---------------|-------|
| v1.0 | Baseline (hystérésis CPU) | 1.3x | - |
| v1.1 | Hystérésis full GPU | **5.8x** | **+346%** |
| v1.2 | Sans cudaDeviceSynchronize() | 5.6x | -3% |
| v1.3 | Shared memory morphologie | 5.7x | +2% |
| v1.4 | Fusion dilation + threshold | 5.6x | -2% |

---

## Résumé des optimisations

| Version | Technique | Impact réel |
|---------|-----------|-------------|
| v1.1 | Kernel hystérésis itératif + atomicOr | **MAJEUR** |
| v1.2 | Retrait cudaDeviceSynchronize() | Négligeable |
| v1.3 | Shared memory (tile loading + halo) | Négligeable |
| v1.4 | Kernel fusion (dilation + threshold) | Négligeable |

**Conclusion** : Seule v1.1 apporte un gain significatif. Le bottleneck actuel est le transfert Host↔Device à chaque frame (cudaMemcpy2D).
