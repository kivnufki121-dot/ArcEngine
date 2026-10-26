// PlayerController.js — movement in map coordinates, independent of Babylon collision meshes.
class PlayerController {
    constructor(app, record) {
        this.app = app;
        this.record = record;
        this.position = { x: record.def.x, y: record.def.y };
        this.heading = record.def.rot[1] * Math.PI / 180;
        this.speed = 0;
        this.jumping = false;
        this.verticalSpeed = 0;
        this.jumpHeight = 0;
        this.previousJump = false;
        this.moving = false;
        this.running = false;
        this.crouching = false;
    }

    update(dt, input) {
        const c = this.app.camera;
        const length = Math.hypot(input.moveX, input.moveY);
        const magnitude = Math.min(1, length);
        const moving = magnitude > 0.01;
        const right = { x: -Math.sin(c.azimuth), y: Math.cos(c.azimuth) };
        const forward = { x: Math.cos(c.azimuth), y: Math.sin(c.azimuth) };
        const vx = right.x * input.moveX - forward.x * input.moveY;
        const vy = right.y * input.moveX - forward.y * input.moveY;
        const crouching = !!input.crouch && !this.jumping;
        const run = !!input.run && moving && !crouching && this.app.game.energy > 0.05;
        const targetSpeed = moving ? (crouching ? 85 : run ? 260 : 165) * magnitude : 0;
        const response = 1 - Math.exp(-12 * Math.max(0, dt));
        this.speed += (targetSpeed - this.speed) * response;
        if (moving) {
            const heading = Math.atan2(vy, vx);
            let delta = Math.atan2(Math.sin(heading - this.heading), Math.cos(heading - this.heading));
            this.heading += delta * (1 - Math.exp(-16 * Math.max(0, dt)));
            const step = this.speed * Math.max(0, dt) / Math.max(1, length);
            this.position.x += vx * step;
            this.position.y += vy * step;
        }
        const bounds = this.app.location;
        this.position.x = Math.max(0, Math.min(bounds.width, this.position.x));
        this.position.y = Math.max(0, Math.min(bounds.height, this.position.y));
        if (input.jump && !this.previousJump && !this.jumping && !crouching) {
            this.jumping = true;
            this.verticalSpeed = 280;
        }
        this.previousJump = input.jump;
        if (this.jumping) {
            this.verticalSpeed -= 850 * dt;
            this.jumpHeight += this.verticalSpeed * dt;
            if (this.jumpHeight <= 0) {
                this.jumpHeight = 0;
                this.verticalSpeed = 0;
                this.jumping = false;
            }
        }
        const def = this.record.def;
        def.x = this.position.x;
        def.y = this.position.y;
        def.h = this.jumpHeight;
        def.rot[1] = this.heading * 180 / Math.PI;
        this.app.location.placeObject(this.record);
        this.moving = moving && this.speed > 2;
        this.running = run;
        this.crouching = crouching;
    }
}
