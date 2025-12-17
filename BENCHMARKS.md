# Benchmarks IRGPU

**GPU** : NVIDIA GeForce RTX 5060  
**CPU** : AMD Ryzen 9 5950X (16 cores, 32 threads)  
**RAM** : 58 Go

Fichiers détaillés dans `/benchmarks/`

---

## Tableau comparatif complet (temps en secondes)

| Vidéo | CPU | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 | Meilleur |
|-------|-----|------|------|------|------|------|------|----------|
| ACET.mp4 | 13.19 | 6.26 | 5.24 | **5.23** | 6.26 | 6.41 | 5.32 | **v1.2** |
| lil_clown_studio.mp4 | 40.62 | 28.70 | 9.49 | 10.09 | 10.31 | 9.36 | **7.96** | **v1.5** |
| 1023-142621257_large.mp4 | 72.27 | 61.09 | **9.52** | 12.21 | 9.37 | 10.05 | 12.02 | **v1.1** |
| 27999-366978301_large.mp4 | 37.60 | 33.62 | 7.37 | **5.43** | 7.36 | 7.76 | 7.66 | **v1.2** |
| 3630-172488409_large.mp4 | 64.26 | 51.81 | 11.09 | 10.94 | 11.16 | 11.37 | **8.55** | **v1.5** |
| 6387-191695740_large.mp4 | 69.01 | 63.80 | 8.78 | 10.85 | 8.46 | **8.12** | 10.22 | **v1.4** |
| 20895-313083562_large.mp4 | 164.57 | 142.12 | 23.21 | 21.66 | 23.05 | 23.20 | **20.99** | **v1.5** |

---

## Speedup vs CPU

| Vidéo | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|-------|------|------|------|------|------|------|
| ACET.mp4 | 2.1x | 2.5x | **2.5x** | 2.1x | 2.1x | 2.5x |
| lil_clown_studio.mp4 | 1.4x | 4.3x | 4.0x | 3.9x | 4.3x | **5.1x** |
| 1023-142621257_large.mp4 | 1.2x | **7.6x** | 5.9x | 7.7x | 7.2x | 6.0x |
| 27999-366978301_large.mp4 | 1.1x | 5.1x | **6.9x** | 5.1x | 4.8x | 4.9x |
| 3630-172488409_large.mp4 | 1.2x | 5.8x | 5.9x | 5.8x | 5.7x | **7.5x** |
| 6387-191695740_large.mp4 | 1.1x | 7.9x | 6.4x | 8.2x | **8.5x** | 6.8x |
| 20895-313083562_large.mp4 | 1.2x | 7.1x | 7.6x | 7.1x | 7.1x | **7.8x** |
| **Moyenne** | **1.3x** | **5.8x** | **5.6x** | **5.7x** | **5.6x** | **5.8x** |

---

## Évolution par version

| Version | Description | Speedup moyen |
|---------|-------------|---------------|
| v1.0 | Baseline (hystérésis CPU) | 1.3x |
| v1.1 | Hystérésis full GPU | **5.8x** |
| v1.2 | Sans cudaDeviceSynchronize() | 5.6x |
| v1.3 | Shared memory morphologie | 5.7x |
| v1.4 | Fusion dilation + threshold | 5.6x |
| v1.5 | Retour à v1.1 (code simple) | **5.8x** |

---

## Conclusion

- **Meilleure optimisation** : v1.1 (hystérésis GPU) → +346% de gain
- **Code final** : v1.5 = v1.1 (kernels simples, pas de shared memory)
- Les optimisations v1.2-v1.4 n'apportent pas de gain mesurable
- **Bottleneck actuel** : Transferts Host↔Device à chaque frame
