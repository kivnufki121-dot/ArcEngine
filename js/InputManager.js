// InputManager.js — keyboard and Xbox-compatible Gamepad API input.
// Poll gamepads once per frame to avoid stale input and event-driven latency.
class InputManager {
    constructor() {
        this.keys = new Set();
        this.deadzone = 0.16;
        this._down = (e) => {
            if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            this.keys.add(e.code);
        };
        this._up = (e) => this.keys.delete(e.code);
        this._blur = () => this.keys.clear();
        window.addEventListener('keydown', this._down);
        window.addEventListener('keyup', this._up);
        window.addEventListener('blur', this._blur);
    }

    /** @param {number} value */
    _axis(value) {
        const magnitude = Math.abs(value);
        if (magnitude <= this.deadzone) return 0;
        return Math.sign(value) * (magnitude - this.deadzone) / (1 - this.deadzone);
    }

    // Standard gamepad mapping: left stick = move; A = jump; B = crouch; RT = fire.
    poll() {
        const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
        const pad = Array.from(pads || []).find(p => p && p.connected && p.mapping === 'standard');
        const held = (code) => this.keys.has(code);
        const axisX = pad ? this._axis(pad.axes[0] || 0) : 0;
        const axisY = pad ? this._axis(pad.axes[1] || 0) : 0;
        const keyX = Number(held('KeyD') || held('ArrowRight')) - Number(held('KeyA') || held('ArrowLeft'));
        const keyY = Number(held('KeyS') || held('ArrowDown')) - Number(held('KeyW') || held('ArrowUp'));
        const button = (i) => !!(pad && pad.buttons[i] && pad.buttons[i].pressed);
        return {
            moveX: Math.max(-1, Math.min(1, axisX + keyX)),
            moveY: Math.max(-1, Math.min(1, axisY + keyY)),
            lookX: pad ? this._axis(pad.axes[2] || 0) : 0,
            lookY: pad ? this._axis(pad.axes[3] || 0) : 0,
            jump: held('Space') || button(0),
            crouch: held('ControlLeft') || held('ControlRight') || button(1),
            run: held('ShiftLeft') || held('ShiftRight') || button(10),
            fire: held('KeyF') || button(7),
            gamepadConnected: !!pad
        };
    }

    dispose() {
        window.removeEventListener('keydown', this._down);
        window.removeEventListener('keyup', this._up);
        window.removeEventListener('blur', this._blur);
        this.keys.clear();
    }
}
