# HNL Flow Bars Card

A custom Home Assistant Lovelace card that visualizes supply vs demand flows as proportional horizontal bars with accolade connectors.

<img width="520" height="70" alt="chrome-capture-2026-06-01" src="https://github.com/user-attachments/assets/9c563cf5-2138-4649-9a84-fa08c7cc4502" /><br/>

<img width="518" height="63" alt="image" src="https://github.com/user-attachments/assets/852d8bfe-4447-419a-a672-e2b42b260841" /><br/>

<img width="510" height="66" alt="image" src="https://github.com/user-attachments/assets/10fb01db-b17a-4e70-8fb2-bc25df63f658" /><br/>

<img width="514" height="58" alt="image" src="https://github.com/user-attachments/assets/dde718e3-3ade-4140-9413-dba374cc8b0a" /><br/>

Production sources (e.g. solar, battery) are shown on top with slanted labels and bracket connectors. Consumption destinations (e.g. house, EV charger) are shown below. Bar widths scale proportionally, with optional remainder bars showing grid import/export.

The main purpose of this card is to show source(s), destination(s), surplus and shortfall - all in one.

So if you need to see:
- How much units are generated?
- How much units are consumed?
- Does anything remain? Or do we fall short?

> units can be solar, water, gas, kilograms, liters, apples, oranges - whatever you want!

Then is the card for you.

## Basic idea

<img width="443" height="233" alt="hnl-flow-bars-card" src="https://github.com/user-attachments/assets/7d2be7f2-a128-4a2d-a7b1-b2caf632d79e" />

The card compares sources (production) against destinations (consumption) as proportional bars. Two possible scenarios:

- A. When sources produce more than destinations consume, the leftover appears as a surplus bar.
- B. When destinations need more than sources provide, the gap appears as a shortfall bar.

Both bars scale proportionally so you can see the balance at a glance.

## Examples
### Example 1 - Current energy flow
- Show how much solar power is generated
- How much of it is consumed
- If something remains: how much flows back to the grid?
- If we fall short: how much is drawn from the grid?

<img width="470" height="62" alt="image" src="https://github.com/user-attachments/assets/caed18fc-78ca-4418-8432-bdad4e134ce2" />

<sub>1a: 805W surplus</sub>

<img width="471" height="63" alt="image" src="https://github.com/user-attachments/assets/427557fe-cc5e-4481-b5fa-4998d5a4ae5f" />

<sub>1b: 822W Shortfall</sub>

### Example 2 - Total energy flow
- Show how much solar power was generated today
- How much of it was consumed
- How much was returned to the grid
- How much was drawn additionally from the grid

<img width="469" height="63" alt="image" src="https://github.com/user-attachments/assets/d2828741-d399-4aa6-99d0-61a1953a8882" />

<sub>2a: 7kWh shortfall</sub>

<img width="471" height="62" alt="image" src="https://github.com/user-attachments/assets/5df197ca-89ae-4f24-a889-59f9dd43aa1a" />

<sub>2b: 7kWh surplus</sub>

### Example 3 - Layout variants

#### Small (half width)
The card performs very well in small spaces (as this was the initial intended purpose when I started work on it). Here's both current power distribution and daily use in two small cards, 6 columns 1 row each:

<img width="514" height="58" alt="image" src="https://github.com/user-attachments/assets/8fec86bd-3b9a-4978-9804-46cd82f56997" />

#### Larger (higher)
Or, spread over 2 rows, with `Show names` enabled:

<img width="472" height="112" alt="image" src="https://github.com/user-attachments/assets/75beb743-19da-467a-a276-da5fa374f36f" />

### Example 4 - Compare whatever you like

As long as the entities you use have a numeric (int/float/decimal) value, you can use them - even if it makes no sense at all.

<img width="468" height="60" alt="image" src="https://github.com/user-attachments/assets/3ee0b6f3-1653-4ce5-9732-84b6a36aa39c" />

You can add as many sources and destinations as you like, but keep in mind that it can become unreadable. The card is designed for 1-3 sources and 1-3 destinations. Any more and legibility will suffer.

<img width="514" height="128" alt="image" src="https://github.com/user-attachments/assets/e252ba3b-bd7f-4217-a801-83478e803079" />

## Don't we already have the Distribution Card for this?

We do, but that card only shows _composition_, not the flow from production to consumption (and its limited to energy entities only). See the difference for yourself:

<img width="510" height="158" alt="image" src="https://github.com/user-attachments/assets/ee50cadb-7ec6-4b70-94ba-5efe6177b35e" />

## Installation

### HACS

HNL Flow Bars Card is available in the official HACS default repository.

1. Open HACS
2. Search for **HNL Flow Bars Card**
3. Install it
4. Restart Home Assistant if prompted
5. Add a card and search for **HNL Flow Bars Card**
6. Use the visual editor to set it up

<img width="371" height="371" alt="image" src="https://github.com/user-attachments/assets/e007e6a4-9776-41bc-8eac-434ac01e2a56" />

#### Custom repository fallback

If the card does not appear in HACS yet, refresh HACS first. If you still need to add it manually:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=c-kick&repository=hnl-flow-bars-card&category=plugin)

Or:

1. Open HACS → three-dot menu → Custom repositories
2. Add `c-kick/hnl-flow-bars-card` with category **Dashboard**
3. Search HACS for **HNL Flow Bars Card** and install it

### Manual
1. Download `hnl-flow-bars-card.js` from the [latest release](https://github.com/c-kick/hnl-flow-bars-card/releases)
2. Copy it to `/config/www/hnl-flow-bars-card.js`
3. Add the resource in Settings → Dashboards → Resources:
   - URL: `/local/hnl-flow-bars-card.js`
   - Type: JavaScript Module

## Configuration

The card is equipped with a visual editor, with which you can adjust all settings.

### General settings

<img width="497" height="412" alt="image" src="https://github.com/user-attachments/assets/f93c26d1-7635-499d-9854-b807ebef1418" />

#### Behaviour

<img width="499" height="214" alt="image" src="https://github.com/user-attachments/assets/0390741a-2156-4691-8aad-8f0607db8489" />

#### Appearance

<img width="499" height="511" alt="image" src="https://github.com/user-attachments/assets/a3d00a05-cc81-404e-9de1-a13f81b18b1e" />

#### Advanced

<img width="497" height="322" alt="image" src="https://github.com/user-attachments/assets/8a3cf940-1ae9-4ed8-b0c1-d1a074781665" />

### Entites

<img width="496" height="518" alt="image" src="https://github.com/user-attachments/assets/c9c4cf92-5e2e-4007-8ae9-f40772748949" />

### Surplus & Shortfall


<img width="490" height="1037" alt="image" src="https://github.com/user-attachments/assets/fc29acf1-8d97-420c-83ac-92f9a757eedc" />

### Settings per entity:

<img width="490" height="703" alt="image" src="https://github.com/user-attachments/assets/99b96877-7ce5-4a0e-a811-bc5981b2f514" />

### Card options

| Option | Type | Default | Description |
|---|---|---|---|
| `production` | list | **required** | Production source entities |
| `consumption` | list | **required** | Consumption destination entities |
| `unit_of_measurement` | string | from entity | Override unit for all bars |
| `global_color` | string | auto-generated | Default bar color for all entities (CSS color, overridden per entity) |
| `global_text_color` | string | `inherit` | Default text color for all entities (overridden per entity) |
| `global_bg_opacity` | string | `inherit` | Default background opacity for all entities and remainders (0–1, overridden per entity) |
| `rounding` | number | `0` | Decimal places for displayed values |
| `hide_zero_values` | bool | `true` | Hide bars with zero values |
| `transparent` | bool | `true` | Remove card background |
| `slanted_edge` | bool | `true` | Slant the right edge of source labels |
| `show_names` | bool | `true` | Show entity names when the card is tall enough |
| `show_icons` | bool | `true` | Show icons inside value labels |
| `clip_labels` | bool/object | `false` | Cut off label text when the bar doesn't have enough space to fit text. Can also reference an entity with `{ entity, default? }` (see [Clipping or non-clipping labels](#clipping-or-non-clipping-labels)) |
| `font_size_scale` | number | `1` | Advanced: scale responsive font growth while preserving automatic sizing |
| `font_size_max` | string | `14px` | Advanced: CSS length, variable, or calculation where responsive font growth stops |
| `css_vars` | object | `{}` | Advanced: override `--hnl-flow-bars-*` CSS custom properties without `card_mod` (see [Available CSS vars keys](#available-css_vars-keys)) |
| `layout` | string | `accolade` | Layout structure: `accolade` or `native` (see [Layouts & Themes](#layouts--themes)) |
| `theme` | string | layout default | Visual theme within the chosen layout (see [Layouts & Themes](#layouts--themes)) |
| `gradient` | bool | `false` | Apply gradient shading to bars |
| `hatched` | bool | `false` | Apply diagonal stripe pattern to remainder bars (shortfall/surplus) |
| `animated` | bool | `false` | Animate background patterns (e.g. hatched stripes) |
| `borders` | bool | layout default | Show bar outlines (default: on for native, off for accolade) |
| `energy_date_selection` | bool | `false` | Sync with HA Energy Dashboard date picker (see [Energy Dashboard integration](#energy-dashboard-integration)) |
| `grid_options` | object | `{}` | Override HA grid sizing (e.g. `{ columns: 6, rows: 2 }`) |
| `production_remainder` | object | | Config for production remainder bar |
| `consumption_remainder` | object | | Config for consumption remainder bar |

### Entity options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | **required** | Entity ID |
| `name` | string | `friendly_name` | Custom display name (shown when card is tall enough) |
| `icon` | string | auto-detected | MDI icon override (defaults: `mdi:solar-power-variant` for sources, `mdi:power-plug` for destinations) |
| `color` | string | auto-generated | CSS color (`#hex`, `rgb()`, `var(--name)`) |
| `bg_opacity` | string | `inherit` | Background opacity (0–1) |
| `text_color` | string | `inherit` | Text color override |
| `unit_of_measurement` | string | from entity | Unit override |
| `invert` | bool | `false` | Multiply the entity value by `-1` before thresholding and positive-value display |
| `zero_threshold` | number | | Treat values with an absolute value at or below this threshold as zero |

`invert` is useful for signed sensors, such as battery power sensors where one direction is
reported as a negative value. `zero_threshold` is applied after inversion and before totals
and remainders are calculated. This is useful for noisy sensors such as EV chargers that
report a few watts while idle. When the threshold turns a value into `0`, the existing
`hide_zero_values` option decides whether that bar is hidden or shown as `0`.

The card only displays positive values. After optional inversion and thresholding, negative
values are clamped to `0`; they are not shown as negative bars, even when every configured
entity is negative. Use `invert: true` on an entity when its negative readings represent the
positive flow you want to visualize.

### Remainder options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | `Shortfall` / `Surplus` | Label |
| `icon` | string | `mdi:eye` | MDI icon |
| `color` | string | theme variable | CSS color |
| `bg_opacity` | string | `inherit` | Background opacity |
| `text_color` | string | theme variable | Text color |
| `unit_of_measurement` | string | from first entity | Unit override (defaults to first source entity for shortfall, first destination for surplus) |

### YAML Configuration

```yaml
type: custom:hnl-flow-bars-card
unit_of_measurement: W
rounding: 0
hide_zero_values: true
energy_date_selection: false
transparent: true
slanted_edge: true
show_names: true
font_size_scale: 1
font_size_max: 14px
css_vars:
  destination-bg-opacity: 1
  label-edge-padding: 1rem
  card-row-height: 72px
layout: accolade
theme: classic
gradient: false
hatched: true
animated: false
production:
  - entity: sensor.solar_power
    icon: mdi:solar-power-variant
  - entity: sensor.battery_discharge
    icon: mdi:battery-arrow-down
    name: Battery
    color: "#4caf50"
    invert: true
consumption:
  - entity: sensor.house_power
    icon: mdi:home
    name: House
  - entity: sensor.ev_charger_power
    icon: mdi:car-electric
    color: "#2196f3"
    zero_threshold: 25
production_remainder:
  name: Grid import
  icon: mdi:transmission-tower-import
consumption_remainder:
  name: Grid export
  icon: mdi:transmission-tower-export
```

### Energy Dashboard integration

When `energy_date_selection` is enabled and the card is placed on a view that contains an `energy-date-selection` card, bar values automatically reflect the selected date range (today, this week, this month, etc.) using recorder statistics instead of live sensor states. This lets you use the card as a companion to the built-in Energy Dashboard.

Requirements:
- Add a `type: energy-date-selection` card to the same view (this is the date picker from the Energy Dashboard)
- Your entities must have recorder statistics available (energy sensors typically do)

```yaml
type: custom:hnl-flow-bars-card
energy_date_selection: true
unit_of_measurement: kWh
production:
  - entity: sensor.solar_energy_today
consumption:
  - entity: sensor.house_energy_today
```

### Responsive behavior

The card adapts to its available height:

- **Compact (1 row):** Only icon + value shown in source labels and destinations.
- **Taller layouts (2+ rows):** Entity names automatically appear below the value in both source labels and destination bars *if the row has enough vertical space for two lines*. Bars always stretch to fill the available card height. The threshold is content-relative (based on `lh` units, not fixed pixels), so it scales with font size.
- **`show_names: false`:** Disables entity names entirely, regardless of available space.
- **`show_icons: false`:** Disables all icons inside the rendered card bars and remainder labels.

The default font sizing is tuned for compact cards and uses a responsive clamp. Large cards can opt into bigger text without losing the compact-card behavior:

```yaml
font_size_scale: 1.2
font_size_max: 18px
```

`font_size_scale` changes how aggressively the responsive font grows. `font_size_max` raises or lowers the ceiling where the font stops growing; use a CSS length or variable such as `18px`, `1.2rem`, `var(--ha-font-size-l)`, or `calc(var(--ha-font-size-m) * 1.25)`. Invalid values are ignored and the default `14px` ceiling remains active.

### Clipping or non-clipping labels

By default, bars keep enough minimum width for their value labels (they don't clip, for as long as there is enough room in the card). If you want bars to keep their exact proportional width instead, enable label clipping:

```yaml
clip_labels: true
```
In these demo images, the bottom card has `clip_labels: true`. Result: the cards "bars" are always proportionate to the values represented (in the screenshots thats roughly 30%/70% for the top two bars), and in regular, non-clipping mode, it tries to keep the value visible even if that means sizing the bar disproportionate to the value it represents. So basically, `clip_labels` determines legibility vs accuracy.

You can also control label clipping from a boolean-like Home Assistant entity:

```yaml
clip_labels:
  entity: input_boolean.clip_flow_bar_labels
  default: false
```

The card treats entity states `on`, `true`, and `1` as enabled, and `off`, `false`, and `0` as disabled. If the entity is missing or has another state, `default` is used when provided; otherwise clipping stays disabled.

<img width="218" height="131" alt="Image" src="https://github.com/user-attachments/assets/89fe29c3-ddaa-48c7-abff-c8b904abcc0d" />

<img width="168" height="136" alt="Image" src="https://github.com/user-attachments/assets/d6bb5dd7-96ec-4207-a6d6-75391ace2b51" />

<img width="116" height="131" alt="Image" src="https://github.com/user-attachments/assets/93c4081d-3605-4f34-afd4-2317f0821c7a" />

<img width="75" height="70" alt="Image" src="https://github.com/user-attachments/assets/90d98b99-f8ea-4a61-9fc8-768b026493d8" />

### Entity warnings

The card shows inline warnings when:
- An entity is not found in Home Assistant
- An entity state is `unavailable` or `unknown`
- An entity has a non-numeric state

### Editor features

The visual editor includes:
- **Entity management:** Add, remove, and reorder entities with up/down buttons per list.
- **Flip button:** Swap all sources and destinations in one click.
- **Entity deduplication:** Already-used entities are excluded from the picker to prevent duplicates.
- **Per-entity customization:** Name, icon, color, text color, background opacity, and unit override per entity.
- **Remainder editors:** Customize shortfall and surplus appearance with a visual diagram explaining the concept.

## Default colors

The card uses the following default colors:

| Bar type | Default color | Notes |
|---|---|---|
| **Sources** | `#ffd407` (yellow) | Production/supply entities |
| **Destinations** | `#8b58bf` (purple) | Consumption/demand entities |
| **Shortfall** | `#ce513a` (red) | Demand that sources couldn't cover |
| **Surplus** | `#3c9940` (green) | Supply that destinations didn't use |

Enable the `hatched` toggle to give remainder bars a diagonal stripe pattern, visually distinguishing them from regular bars.

These defaults are defined in `src/const.js` and can be overridden per entity/remainder in the card config. For card-wide styling, use `css_vars`. Keys are written without the `--hnl-flow-bars-` prefix:

```yaml
css_vars:
  color-production: "#ffd407"
  color-consumption: "#8b58bf"
  color-shortfall: "#ce513a"
  color-surplus: "#3c9940"
  destination-bg-opacity: 0.65
  card-row-height: 72px
```

Advanced users can also use the full CSS custom property name, such as `--hnl-flow-bars-card-row-height`, but the shorter `css_vars` form is recommended in card YAML.

### Available `css_vars` keys:

| Key | Default | Description |
|---|---|---|
| `color-production` | `#ffd407` | Base color for production/source bars |
| `color-production-0` | derived from `color-production` | First generated production palette color |
| `color-production-1` | derived from `color-production` | Darker, hue-shifted production palette color |
| `color-production-2` | derived from `color-production` | Lighter, hue-shifted production palette color |
| `color-production-3` | derived from `color-production` | Darker production palette color with a wider hue shift |
| `color-consumption` | `#8b58bf` | Base color for consumption/destination bars |
| `color-consumption-0` | derived from `color-consumption` | First generated consumption palette color |
| `color-consumption-1` | derived from `color-consumption` | Darker, hue-shifted consumption palette color |
| `color-consumption-2` | derived from `color-consumption` | Lighter, hue-shifted consumption palette color |
| `color-consumption-3` | derived from `color-consumption` | Darker consumption palette color with a wider hue shift |
| `color-shortfall` | `#ce513a` | Remainder color when consumption is greater than production |
| `color-surplus` | `#3c9940` | Remainder color when production is greater than consumption |
| `color-default` | `hsl(205, 90%, 55%)` | Fallback color if a generated bar color cannot be resolved |
| `accolade-bg-opacity` | `0.4` | Background opacity for accolade connector bars |
| `destination-bg-opacity` | `0.65` | Background opacity for destination bars |
| `accolade-border-width` | `2px` | Border width for accolade connector bars |
| `accolade-height` | `8px` | Height of the accolade connector row |
| `border-radius` | `calc(var(--ha-card-border-radius, 14px) / 2)` | Radius used by bar corners and value pills |
| `label-padding` | `0.1em 0.5em` | Padding inside source labels and value pills |
| `label-edge-padding` | `calc(var(--hnl-flow-bars-font-size, 0.8em) * .7)` | Extra padding near the slanted source-label edge |
| `font-size-min` | `var(--ha-font-size-xs, 9px)` | Lower bound for responsive card text |
| `font-size-fluid` | `22cqb` | Responsive text-size middle value |
| `font-size-max` | `14px` | Upper bound for responsive card text |
| `font-size-scale` | `1` | Internal scale value for responsive text sizing |
| `font-size` | responsive `clamp(...)` | Final card font size; usually prefer `font_size_scale` and `font_size_max` |
| `icon-size` | `min(calc(var(--hnl-flow-bars-font-size, 0.8em) + 0.5em), 1.2em)` | Size of icons inside labels |
| `card-row-height` | `56px` | Intrinsic card height, mainly for Masonry layout |
| `card-grid-gap` | `4px` | Gap between rows in native layouts |

## Grid sizing

The card defaults to 12 columns × 1 row in HA section views (`min_columns: 3`, `min_rows: 1`). Override with `grid_options` in the card config, or resize via the HA UI.

In masonry layout, Home Assistant uses `getCardSize()` for column balancing but the card still needs an intrinsic height. Advanced users can override `card-row-height` through `css_vars` to control that minimum height:

```yaml
css_vars:
  card-row-height: 72px
```

This sets the card row height to `72px`, which makes the card visible in Masonry.

## Layouts & Themes

- **Layouts** determine how the elements are structured: `accolade` (bracket connectors) or `native` (stacked bar rows).
- **Themes** determine the visual shape of bars within the chosen layout.
   - **Accolade:** `classic` (default)
   - **Native:** `default` (pill-shaped), `split-pill`, `minimal`, `contained`
- **Toggles** are independent switches that combine with any layout and theme:
   - `gradient` — gradient shading on bars
   - `hatched` — diagonal stripe pattern on remainder bars (shortfall/surplus)
   - `animated` — animates background patterns (e.g. scrolling hatched stripes)
   - `clip_labels` — cut off label text when the bar doesn't have enough space to fit text

Below is an overview of the available themes (screenshots taken using the default HA theme in dark-mode)

<sup>note: this is from v1.4.0 and might not be up to date</sup>

<img width="2136" height="2124" alt="scrnli_78tV96eZf90bNh" src="https://github.com/user-attachments/assets/94d2dc29-2d7e-40ab-a6c0-660fb4a8dd52" />


## Development

```bash
git clone https://github.com/c-kick/hnl-flow-bars-card.git
cd hnl-flow-bars-card
npm install
npm start    # watch mode with dev server on :5000
npm run build  # production build
```

The card CSS is split into two Lit CSS modules for maintainers:
`src/scaffolding.js` owns structural layout, sizing, overflow, and label fitting;
`src/styles.js` owns visual styling such as colors, typography, borders,
backgrounds, hatching, and animations.

## License

MIT
