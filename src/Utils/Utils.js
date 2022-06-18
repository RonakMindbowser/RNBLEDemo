/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
export function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export const HSBToRGB = (h, s, b) => {
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return [255 * f(5), 255 * f(3), 255 * f(1)];
};

export function hsv2rgb(h, s, v) {
    // var h = hsv.hue, s = hsv.sat, v = hsv.val;
    var rgb, i, data = [];
    if (s === 0) {
        rgb = [v, v, v];
    } else {
        h = h / 60;
        i = Math.floor(h);
        data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
        switch (i) {
            case 0:
                rgb = [v, data[2], data[0]];
                break;
            case 1:
                rgb = [data[1], v, data[0]];
                break;
            case 2:
                rgb = [data[0], v, data[2]];
                break;
            case 3:
                rgb = [data[0], data[1], v];
                break;
            case 4:
                rgb = [data[2], data[0], v];
                break;
            default:
                rgb = [v, data[0], data[1]];
                break;
        }
    }
    return '#' + rgb.map(function (x) {
        return ("0" + Math.round(x * 255).toString(16)).slice(-2);
    }).join('');
};

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const pinkColorList = [
    {
        name: "Pink",
        hexColor: "#FFC0CB"
    },
    {
        name: "LightPink",
        hexColor: "#FFB6C1"
    },
    {
        name: "HotPink",
        hexColor: "#FF69B4"
    },
    {
        name: "DeepPink",
        hexColor: "#FF1493"
    },
    {
        name: "PaleVioletRed",
        hexColor: "#DB7093"
    },
    {
        name: "MediumVioletRed",
        hexColor: "#C71585"
    },
]

// export function hslToHex(h, s, l) {
//     l /= 100;
//     const a = s * Math.min(l, 1 - l) / 100;
//     const f = n => {
//         const k = (n + h / 30) % 12;
//         const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
//         return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
//     };
//     return `#${f(0)}${f(8)}${f(4)}`;
// }

export function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

export const NO_EFFECTS = "No Effects";

export const DIM_ROMANCE = "Dim Romance";
export const DIM_SLOW_MUSIC = "Dim Slow Music";
export const POLICE = "Police";
export const FIRE_CRACKER = "Fire Cracker";

export const ALIENS = "Alien";
export const MAGIC = "Magic";
export const FANTASY = "Fantasy";
export const LETS_DANCE = "Let's Dance";

export const getEffectRGBData = (effectName) => {
    let list = [];

    let rData = [];
    let gData = [];
    let bData = [];

    switch (effectName) {
        case DIM_SLOW_MUSIC:
            rData[0] = 0x40;
            rData[1] = 0x40;
            rData[2] = 0x15;
            rData[3] = 0x00;
            rData[4] = 0x02;
            rData[5] = 0x32;
            rData[6] = 0x35;
            rData[7] = 0x40;

            gData[0] = 0x00;
            gData[1] = 0x00;
            gData[2] = 0x00;
            gData[3] = 0x00;
            gData[4] = 0x00;
            gData[5] = 0x00;
            gData[6] = 0x00;
            gData[7] = 0x00;

            bData[0] = 0x00;
            bData[1] = 0x00;
            bData[2] = 0x00;
            bData[3] = 0x17;
            bData[4] = 0x40;
            bData[5] = 0x40;
            bData[6] = 0x00;
            bData[7] = 0x32;
            break;

        case DIM_ROMANCE:
            rData[0] = 0x40;
            rData[1] = 0x26;
            rData[2] = 0x1A;
            rData[3] = 0x40;
            rData[4] = 0x26;
            rData[5] = 0x40;
            rData[6] = 0x26;
            rData[7] = 0x1A;

            gData[0] = 0x00;
            gData[1] = 0x00;
            gData[2] = 0x00;
            gData[3] = 0x00;
            gData[4] = 0x00;
            gData[5] = 0x00;
            gData[6] = 0x00;
            gData[7] = 0x00;

            bData[0] = 0x00;
            bData[1] = 0x1B;
            bData[2] = 0x00;
            bData[3] = 0x00;
            bData[4] = 0x1B;
            bData[5] = 0x00;
            bData[6] = 0x1B;
            bData[7] = 0x00;
            break;

        case POLICE:
            rData[0] = 0xFF;
            rData[1] = 0x2B;
            rData[2] = 0xFF;
            rData[3] = 0x2B;
            rData[4] = 0xFF;
            rData[5] = 0x2B;
            rData[6] = 0xFF;
            rData[7] = 0x2B;

            gData[0] = 0x00;
            gData[1] = 0x00;
            gData[2] = 0x00;
            gData[3] = 0x00;
            gData[4] = 0x00;
            gData[5] = 0x00;
            gData[6] = 0x00;
            gData[7] = 0x00;

            bData[0] = 0x00;
            bData[1] = 0xFF;
            bData[2] = 0x00;
            bData[3] = 0xFF;
            bData[4] = 0x00;
            bData[5] = 0xFF;
            bData[6] = 0x00;
            bData[7] = 0xFF;
            break;

        case FIRE_CRACKER:
            rData[0] = 0x80;
            rData[1] = 0xFF;
            rData[2] = 0xCC;
            rData[3] = 0xFF;
            rData[4] = 0x80;
            rData[5] = 0xFF;
            rData[6] = 0xCC;
            rData[7] = 0xFF;

            gData[0] = 0x80;
            gData[1] = 0xCE;
            gData[2] = 0x00;
            gData[3] = 0x81;
            gData[4] = 0x80;
            gData[5] = 0xCE;
            gData[6] = 0x00;
            gData[7] = 0x81;

            bData[0] = 0x80;
            bData[1] = 0x00;
            bData[2] = 0x00;
            bData[3] = 0x00;
            bData[4] = 0x80;
            bData[5] = 0x00;
            bData[6] = 0x00;
            bData[7] = 0x00;
            break;

        case ALIENS:
            rData[0] = 0x00;
            rData[1] = 0x00;
            rData[2] = 0x00;
            rData[3] = 0x00;
            rData[4] = 0x00;
            rData[5] = 0x00;
            rData[6] = 0x00;
            rData[7] = 0x00;

            gData[0] = 0xFF;
            gData[1] = 0xCC;
            gData[2] = 0xA6;
            gData[3] = 0x80;
            gData[4] = 0x66;
            gData[5] = 0x4D;
            gData[6] = 0x33;
            gData[7] = 0x1A;

            bData[0] = 0x00;
            bData[1] = 0x00;
            bData[2] = 0x00;
            bData[3] = 0x00;
            bData[4] = 0x00;
            bData[5] = 0x00;
            bData[6] = 0x00;
            bData[7] = 0x00;
            break;

        case FANTASY:
            rData[0] = 0x00;
            rData[1] = 0x00;
            rData[2] = 0x00;
            rData[3] = 0x00;
            rData[4] = 0x00;
            rData[5] = 0x00;
            rData[6] = 0x00;
            rData[7] = 0x00;

            gData[0] = 0x00;
            gData[1] = 0x00;
            gData[2] = 0x00;
            gData[3] = 0x00;
            gData[4] = 0x00;
            gData[5] = 0x00;
            gData[6] = 0x00;
            gData[7] = 0x00;

            bData[0] = 0x1A;
            bData[1] = 0x33;
            bData[2] = 0x4D;
            bData[3] = 0x66;
            bData[4] = 0x80;
            bData[5] = 0xA6;
            bData[6] = 0xCC;
            bData[7] = 0xFF;
            break;

        case MAGIC:
            rData[0] = 0x00;
            rData[1] = 0x80;
            rData[2] = 0x00;
            rData[3] = 0x66;
            rData[4] = 0x00;
            rData[5] = 0x33;
            rData[6] = 0x00;
            rData[7] = 0x1A;

            gData[0] = 0x00;
            gData[1] = 0x80;
            gData[2] = 0x00;
            gData[3] = 0x66;
            gData[4] = 0x00;
            gData[5] = 0x33;
            gData[6] = 0x00;
            gData[7] = 0x1A;

            bData[0] = 0x33;
            bData[1] = 0x80;
            bData[2] = 0x66;
            bData[3] = 0x66;
            bData[4] = 0x99;
            bData[5] = 0x33;
            bData[6] = 0xCC;
            bData[7] = 0x1A;
            break;

        case LETS_DANCE:
            rData[0] = 0xFF;
            rData[1] = 0x00;
            rData[2] = 0x00;
            rData[3] = 0xFF;
            rData[4] = 0xFF;
            rData[5] = 0x00;
            rData[6] = 0x00;
            rData[7] = 0xFF;

            gData[0] = 0x00;
            gData[1] = 0x00;
            gData[2] = 0xFF;
            gData[3] = 0x00;
            gData[4] = 0x00;
            gData[5] = 0x00;
            gData[6] = 0xFF;
            gData[7] = 0x00;

            bData[0] = 0x00;
            bData[1] = 0xFF;
            bData[2] = 0x00;
            bData[3] = 0xE7;
            bData[4] = 0x00;
            bData[5] = 0xFF;
            bData[6] = 0x00;
            bData[7] = 0xE7;
            break;
    }

    list[0] = rData
    list[1] = gData
    list[2] = bData
    return list;
}

export const getEffectsData = (effectName) => {
    let effectData = [];
    switch (effectName) {
        case DIM_SLOW_MUSIC:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x05;
            effectData[3] = 0x99;
            break;
        case DIM_ROMANCE:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x02;
            effectData[3] = 0x10;
            break;
        case NO_EFFECTS:
            effectData[0] = 0x00;
            effectData[1] = 0x00;
            effectData[2] = 0x00;
            effectData[3] = 0x1E;
            break;

        case POLICE:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x02;
            effectData[3] = 0x03;
            break;

        case FIRE_CRACKER:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x03;
            effectData[3] = 0x02;
            break;

        case ALIENS:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x02;
            effectData[3] = 0x05;
            break;

        case FANTASY:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x02;
            effectData[3] = 0x10;
            break;

        case MAGIC:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x02;
            effectData[3] = 0x10;
            break;

        case LETS_DANCE:
            effectData[0] = 0x01;
            effectData[1] = 0x00;
            effectData[2] = 0x03;
            effectData[3] = 0x03;
            break;
    }
    return effectData;
}