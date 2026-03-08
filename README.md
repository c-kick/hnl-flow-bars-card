# HNL Power Bars Card

A custom Home Assistant Lovelace card that visualizes power production vs consumption as proportional stacked bars with accolade connectors.

Production sources (e.g. solar, battery) are shown on top with slanted labels and bracket connectors. Consumption destinations (e.g. house, EV charger) are shown below. Bar widths scale proportionally, with optional remainder bars showing grid import/export.

## Installation

### HACS (recommended)
1. Open HACS → Frontend → three-dot menu → Custom repositories
2. Add `c-kick/hnl-power-bars-card` as a **Dashboard** repository
3. Install "HNL Power Bars Card"
4. Restart Home Assistant

### Manual
1. Download `hnl-power-bars-card.js` from the [latest release](https://github.com/c-kick/hnl-power-bars-card/releases)
2. Copy it to `/config/www/hnl-power-bars-card.js`
3. Add the resource in Settings → Dashboards → Resources:
   - URL: `/local/hnl-power-bars-card.js`
   - Type: JavaScript Module

## Configuration

```yaml
type: custom:hnl-power-bars-card
unit_of_measurement: W
rounding: 0
hide_zero_values: true
transparent: true
easing: false
production:
  - entity: sensor.solar_power
    icon: mdi:solar-power-variant
  - entity: sensor.battery_discharge
    icon: mdi:battery-arrow-down
    color: "#4caf50"
consumption:
  - entity: sensor.house_power
    icon: mdi:home
  - entity: sensor.ev_charger_power
    icon: mdi:car-electric
    color: "#2196f3"
production_remainder:
  name: Grid import
  icon: mdi:transmission-tower-import
consumption_remainder:
  name: Grid export
  icon: mdi:transmission-tower-export
```

### Card options

| Option | Type | Default | Description |
|---|---|---|---|
| `production` | list | **required** | Production source entities |
| `consumption` | list | **required** | Consumption destination entities |
| `unit_of_measurement` | string | from entity | Override unit for all bars |
| `rounding` | number | `0` | Decimal places for displayed values |
| `hide_zero_values` | bool | `true` | Hide bars with zero values |
| `transparent` | bool | `true` | Remove card background |
| `easing` | bool | `false` | Smooth value transitions |
| `production_remainder` | object | | Config for production remainder bar |
| `consumption_remainder` | object | | Config for consumption remainder bar |

### Entity options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | **required** | Entity ID |
| `icon` | string | auto-detected | MDI icon override |
| `color` | string | auto-generated | CSS color |
| `bg_opacity` | string | `inherit` | Background opacity |
| `text_color` | string | `inherit` | Text color override |
| `unit_of_measurement` | string | from entity | Unit override |

### Remainder options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | "Production/Consumption remainder" | Label |
| `icon` | string | `mdi:eye` | MDI icon |
| `color` | string | theme variable | CSS color |
| `bg_opacity` | string | `inherit` | Background opacity |
| `text_color` | string | theme variable | Text color |

## Theming

The card exposes CSS variables for customization. Set a base production/consumption color and variations are auto-generated using `oklch()`:

```css
:host {
  --hnl-power-bars-color-production: #ffc107;
  --hnl-power-bars-color-consumption: var(--energy-grid-consumption-color);
}
```

## Development

```bash
git clone https://github.com/c-kick/hnl-power-bars-card.git
cd hnl-power-bars-card
npm install
npm start    # watch mode with dev server on :5000
npm run build  # production build
```

## License

MIT
