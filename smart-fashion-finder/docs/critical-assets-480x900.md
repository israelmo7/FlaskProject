# Critical Assets Pack — Standard Fit 480×900

Canvas: **480×900 PNG RGBA**. Anchors (px): head y≈49 · shoulders y≈157 · hips y≈360 · feet y≈787.

## Status (this branch)

### A2 Bases (clean / barefoot)
| File | Status |
|------|--------|
| `bases/man.png` + `turn/man_*.png` | Boxers/shoes cleaned (front waist skin-filled on outerwear pass) |
| `bases/woman.png` + turn | Light cleanup |
| `bases/teenBoy.png` + turn | Cleaned |
| `bases/teenGirl.png` + turn | Light cleanup |
| `bases/boy.png` + turn | Boxers cleaned; shoes partial |
| `bases/girl.png` + turn | Light cleanup |

Artist pass still recommended: remove baked tank tops and any residual artifacts for a true nude-waist base.

### Open-Front Outerwear (aligned to shoulders ≈150px)
| File | Catalog IDs |
|------|-------------|
| `layers/cutouts/bomber-open.png` | `p-bomber` |
| `layers/cutouts/denim-jkt-open.png` | `p-denim-jkt`, `p-blazer` |
| `layers/cutouts/leather-open.png` | `p-leather`, `p-coat` |
| `layers/cutouts/hoodie-open.png` | `p-hoodie`, `p-hoodie-black` |

Regenerate anytime:

```bash
python3 scripts/build-open-front-cutouts.py
```

### Fitted Combos
| File | `FITTED_COMBOS` key | Status |
|------|---------------------|--------|
| `fit/man/combo-oxford-jeans.png` | `p-oxford\|p-jeans` | Painted asset kept |
| `fit/man/combo-bomber-jeans.png` | `p-bomber\|p-jeans` | Painted asset kept |

## Next artist upload priority
1. True bare bases (no tank/boxers/shoes) — man + woman first  
2. Hand-painted open-front bomber / denim on the grid (replace procedural punch)  
3. Remastered combo-oxford-jeans + combo-bomber-jeans  
