'use strict';

/**
 * Plot result from beam analysis
 */
class AnalysisPlotter {

    constructor(container) {

        this.canvas =
            document.getElementById(container);

        this.ctx =
            this.canvas.getContext('2d');

        // canvas size
        this.canvas.width = 1200;
        this.canvas.height = 800;

        // padding
        this.padding = {
            top: 80,
            right: 60,
            bottom: 70,
            left: 100
        };
    }

    /**
     * Plot diagram
     */
    plot(data) {

        const ctx =
            this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // ======================
        // DATA
        // ======================

        const beam =
            data.beam;

        const equation =
            data.equation;

        const xMax =
            beam.primarySpan +
            (beam.secondarySpan || 0);

        // ======================
        // STEP CONFIG
        // ======================

        // grid step
        const xGridStep =
            data.xGridStep || 1;

        const yGridStep =
            data.yGridStep || 20;

        // label step
        const xLabelStep =
            data.xLabelStep || xGridStep;

        const yLabelStep =
            data.yLabelStep || yGridStep;

        // decimal format
        const xDecimal =
            data.xDecimal ?? 0;

        const yDecimal =
            data.yDecimal ?? 0;

        // ======================
        // SIZE
        // ======================

        const width =
            this.canvas.width -
            this.padding.left -
            this.padding.right;

        const height =
            this.canvas.height -
            this.padding.top -
            this.padding.bottom;

        // ======================
        // GET Y RANGE
        // ======================

        let maxY = -Infinity;
        let minY = Infinity;

        for (
            let x = 0;
            x <= xMax;
            x += 0.1
        ) {

            const point =
                equation(x);

            if (point.y > maxY) {
                maxY = point.y;
            }

            if (point.y < minY) {
                minY = point.y;
            }
        }

        // ======================
        // ROUNDING Y
        // ======================
        const yPadding = data.yPadding ?? true;
        maxY =
            Math.ceil(maxY / yGridStep) *
            yGridStep;

        if (yPadding && maxY !== 0) {
            maxY += yGridStep;
        }

        minY =
            Math.floor(minY / yGridStep) *
            yGridStep;

        if (yPadding && minY !== 0) {
            minY -= yGridStep;
        }

        if (minY > 0) {
            minY = 0;
        }

        if (maxY < 0) {
            maxY = 0;
        }

        // ======================
        // SCALE
        // ======================

        const xScale =
            width / xMax;

        let yRange = maxY - minY;
        
        const yScale =
            height / yRange;

        // ======================
        // ORIGIN
        // ======================

        const originX =
            this.padding.left;

        const originY =
            this.padding.top +
            (maxY * yScale);

        // ======================
        // BACKGROUND
        // ======================

        ctx.fillStyle =
            '#ffffff';

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // ======================
        // GRID HORIZONTAL
        // ======================

        for (
            let y = minY;
            y <= maxY;
            y += yGridStep
        ) {

            const posY =
                originY -
                (y * yScale);

            ctx.beginPath();

            ctx.moveTo(
                originX,
                posY
            );

            ctx.lineTo(
                originX + width,
                posY
            );

            ctx.strokeStyle =
                'rgba(199, 199, 199, 0.41)';

            ctx.lineWidth =
                1;

            ctx.stroke();

            // ======================
            // LABEL Y
            // ======================

            if (
                Math.round(y / yLabelStep) *
                yLabelStep === y
            ) {

                ctx.font =
                    '12px Arial';

                ctx.fillStyle =
                    '#000';

                ctx.textAlign =
                    'right';

                ctx.fillText(
                    Number(y).toFixed(yDecimal),
                    originX - 15,
                    posY + 5
                );
            }
        }

        // ======================
        // GRID VERTICAL
        // ======================

        for (
            let x = 0;
            x <= xMax;
            x += xGridStep
        ) {

            const posX =
                originX +
                (x * xScale);

            ctx.beginPath();

            ctx.moveTo(
                posX,
                this.padding.top
            );

            ctx.lineTo(
                posX,
                this.padding.top +
                height
            );

            ctx.strokeStyle =
                'rgba(199, 199, 199, 0.41)';

            ctx.lineWidth =
                1;

            ctx.stroke();

            // ======================
            // LABEL X
            // ======================

            if (
                Math.round(x / xLabelStep) *
                xLabelStep === x
            ) {

                ctx.font =
                    '12px Arial';

                ctx.fillStyle =
                    '#000';

                ctx.textAlign =
                    'center';

                ctx.fillText(
                    Number(x).toFixed(xDecimal),
                    posX,
                    this.canvas.height - this.padding.bottom + 30
                );
            }
        }

        // ======================
        // AXIS
        // ======================

        // garis horizontal X
        ctx.beginPath();

        ctx.moveTo(
            originX,
            originY
        );

        ctx.lineTo(
            originX + width,
            originY
        );

        ctx.strokeStyle =
            'rgba(199, 199, 199, 0.41)';

        ctx.lineWidth =
            1;

        ctx.stroke();

        // garis vertical Y
        ctx.beginPath();

        ctx.moveTo(
            originX,
            originY
        );

        ctx.lineTo(
            originX,
            this.padding.top + height
        );

        ctx.strokeStyle =
            'rgba(199, 199, 199, 0.41)';

        ctx.lineWidth =
            2;

        ctx.stroke();

        // ======================
        // TITLE
        // ======================

        ctx.font =
            '12px Arial';

        ctx.fillStyle =
            '#000000';

        ctx.textAlign =
            'center';

        ctx.fillText(
            data.title ||
            'Diagram',
            this.canvas.width / 2,
            45
        );

        // ======================
        // AXIS LABEL
        // ======================

        // Horizontal label
        ctx.font =
            '12px Arial';

        ctx.fillStyle =
            '#000';

        ctx.textAlign =
            'center';

        ctx.fillText(
            data.xLabel ||
            'Panjang (m)',
            originX + (width / 2),
            this.canvas.height - 20
        );

        // Vertical label
        ctx.save();

        ctx.translate(
            30,
            this.padding.top + (height / 2)
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.font =
            '12px Arial';

        ctx.fillStyle =
            '#000';

        ctx.textAlign =
            'center';

            
        ctx.fillText(
            data.yLabel ||
            'Nilai',
            -20,
            0
        );

        ctx.restore();

        // ======================
        // DRAW FILLED AREA
        // ======================

        ctx.beginPath();

        ctx.moveTo(
            originX,
            originY
        );

        for (
            let x = 0;
            x <= xMax;
            x += 0.05
        ) {

            const point =
                equation(x);

            const canvasX =
                originX +
                (x * xScale);

            const canvasY =
                originY -
                (point.y * yScale);

            ctx.lineTo(
                canvasX,
                canvasY
            );
        }

        ctx.lineTo(
            originX + (xMax * xScale),
            originY
        );

        ctx.closePath();

        ctx.fillStyle =
            'rgba(104, 104, 104, 0.12)';

        ctx.fill();

        // ======================
        // DRAW LINE GRAPH
        // ======================

        ctx.beginPath();

        for (
            let x = 0;
            x <= xMax;
            x += 0.05
        ) {

            const point =
                equation(x);

            const canvasX =
                originX +
                (x * xScale);

            const canvasY =
                originY -
                (point.y * yScale);

            if (x === 0) {

                ctx.moveTo(
                    canvasX,
                    canvasY
                );

            } else {

                ctx.lineTo(
                    canvasX,
                    canvasY
                );
            }
        }

        // MAIN LINE GARPH
        ctx.strokeStyle =
            '#ff0000';

        ctx.lineWidth =
            2;

        ctx.stroke();
    }
}