'use strict';

/** ============================ Beam Analysis Data Type ============================ */

/**
 * Beam material specification.
 *
 * @param {String} name         Material name
 * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
 */
class Material {
    constructor(name, properties) {
        this.name = name;
        this.properties = properties;
    }
}

/**
 *
 * @param {Number} primarySpan          Beam primary span length
 * @param {Number} secondarySpan        Beam secondary span length
 * @param {Material} material           Beam material object
 */
class Beam {
    constructor(primarySpan, secondarySpan, material) {
        this.primarySpan = primarySpan;
        this.secondarySpan = secondarySpan;
        this.material = material;
    }
}

/** ============================ Beam Analysis Class ============================ */

class BeamAnalysis {
    constructor() {
        this.options = {
            condition: 'simply-supported'
        };

        this.analyzer = {
            'simply-supported': new BeamAnalysis.analyzer.simplySupported(),
            'two-span-unequal': new BeamAnalysis.analyzer.twoSpanUnequal()
        };
    }
    /**
     *
     * @param {Beam} beam
     * @param {Number} load
     */
    getDeflection(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getDeflectionEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getBendingMoment(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getBendingMomentEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getShearForce(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getShearForceEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
}




/** ============================ Beam Analysis Analyzer ============================ */

/**
 * Available analyzers for different conditions
 */
BeamAnalysis.analyzer = {};

/**
 * Calculate deflection, bending stress and shear stress for a simply supported beam
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.simplySupported = class {
    constructor(beam, load) {
        this.beam = beam;
        this.load = load;
    }
    getDeflectionEquation(beam, load) {

        const L = beam.primarySpan;
        const EI = beam.material.properties.EI / 1000000000;

        const j2 = beam.j2 || 1;

        return function (x) {

            let y =
                -((load * x) / (24 * EI)) *
                (
                    Math.pow(L, 3)
                    - (2 * L * Math.pow(x, 2))
                    + Math.pow(x, 3)
                ) *
                j2 *
                1000;

            return {
                x: x,
                y: y
            };
        };
    }
    getBendingMomentEquation(beam, load) {
        const L = beam.primarySpan;

        return function (x) {
            
            let y = ( load * x * (L - x)) / 2;
            return {
                x: x,
                y: y
            };
        };
    }

    getShearForceEquation(beam, load) {
        const L = beam.primarySpan;
        return function (x) {
            let y = load * ((L / 2) - x);

            return {
                x: x,
                y: y
            };
        };
    }
};


/**
 * Calculate deflection, bending stress and shear stress for a beam with two spans of equal condition
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.twoSpanUnequal = class {
    constructor(beam, load) {
        this.beam = beam;
        this.load = load;
    }
    getReactions(beam, load) {

        const L1 = beam.primarySpan;
        const L2 = beam.secondarySpan;

        // Internal support moment
        const Mi =
            -(
                (load * Math.pow(L1, 3)) +
                (load * Math.pow(L2, 3))
            ) /
            (
                8 * (L1 + L2)
            );

        // Reactions
        const R1 =
            (Mi / L1) +
            ((load * L1) / 2);

        const R3 =
            (Mi / L2) +
            ((load * L2) / 2);

        const R2 =
            (load * L1) +
            (load * L2) -
            R1 -
            R3;

        return {
            Mi,
            R1,
            R2,
            R3
        };
    }
    getDeflectionEquation(beam, load) {

        // =====================================================
        // Beam Data
        // =====================================================

        const L1 =
            beam.primarySpan;

        const L2 =
            beam.secondarySpan;

        const L = L1 + L2;

        const EI =
            beam.material.properties.EI / 1000000000;

        const j2 =
            beam.j2 || 1;

        // =====================================================
        // Reactions
        // =====================================================

        const reaction =
            this.getReactions(beam, load);

        const R1 =
            reaction.R1;

        const R2 =
            reaction.R2;

        // =====================================================
        // S1
        // 0 <= x <= L1
        // =====================================================
        function S1(x) {

            return (
                x * (
                        (4 * R1 * Math.pow(x, 2)) 
                        - 
                        (load * Math.pow(x, 3)) 
                        +
                        (load * Math.pow(L1, 3)) 
                        - 
                        (4 * R1 * Math.pow(L1, 2))
                    )
            ) / (24 * EI) * 1000 * j2;
        }
        // =====================================================
        // S2
        // L1 <= x <= L
        // =====================================================
        function S2(x) {
            return (
                        (
                            (R1 * x / 6) *
                            (
                                Math.pow(x, 2)
                                - Math.pow(L1, 2)
                            )
                        )
                        +
                        (
                            (R2 * x / 6) *
                            (
                                Math.pow(x, 2)
                                - (3 * L1 * x)
                                + (3 * Math.pow(L1, 2))
                            )
                        )
                        -
                        (
                            R2 * Math.pow(L1, 3) / 6
                        )
                        -
                        (
                            (load * x / 24) *
                            (
                                Math.pow(x, 3)
                                - Math.pow(L1, 3)
                            )
                        )
                    )
                    * (1 / EI)
                    * 1000 * j2;
        }
        // const correction = S1(L1) - S2(L1);
        // =====================================================
        // Return Function
        // =====================================================
        return function (x) {
            let y = 0;
            // =================================================
            // Left Span
            // =================================================
            if (x >= 0 && x <= L1) {
                y = S1(x);
            }
            // =================================================
            // Right Span
            // =================================================
            else if (x > L1 && x <= L) {
                y = S2(x);
            }
            // =================================================
            // Convert to mm
            // =================================================
            
            return {
                x: x,
                y: y
            };
        };
    }

    getBendingMomentEquation(beam, load) {

    const L1 = beam.primarySpan;

    const reaction =
        this.getReactions(beam, load);

    const R1 = reaction.R1;
    const R2 = reaction.R2;

    return function (x) {

        let y = 0;

        if (x <= L1) {

            y =
                (R1 * x) -
                (
                    load *
                    Math.pow(x, 2)
                ) / 2;

        } else {

            y =
                (R1 * x) +
                (
                    R2 *
                    (x - L1)
                ) -
                (
                    load *
                    Math.pow(x, 2)
                ) / 2;
        }

        return {
            x: x,
            y: y
        };
    };
}
    getShearForceEquation(beam, load) {

    const L1 = beam.primarySpan;

    const reaction =
        this.getReactions(beam, load);

    const R1 = reaction.R1;
    const R2 = reaction.R2;

    return function (x) {

        let y = 0;

        if (x < L1) {

            y =
                R1 -
                (load * x);

        } else {

            y =
                R1 +
                R2 -
                (load * x);
        }

        return {
            x: x,
            y: y
        };
    };
}
};