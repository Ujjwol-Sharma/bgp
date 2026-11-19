/* ==========================================================================
   BPG ACADEMY — STATE SYNCHRONIZATION & MASTER DATABASE (js/state-sync.js)
   Strict Single-Class Dedicated Architecture:
   - Shared Master Key: bpg_master_database_v1
   - Real-Time BroadcastChannel: bpg_academy_sync
   - Exactly 4 Dedicated Workspaces (Class 10, Class 11, Class 12, Entrance)
   - Zero Tiered Pricing / Access Plans
   ========================================================================== */

var BPG_MASTER_DB_PRIMARY = window.BPG_MASTER_DB_PRIMARY = 'bpg_master_db';
var BPG_MASTER_DB_KEY = window.BPG_MASTER_DB_KEY = 'bpg_master_database_v1';
var BPG_STORAGE_KEY = window.BPG_STORAGE_KEY = 'bpg_maths_academy_cms_v8';
var BPG_ACCOUNTS_KEY = window.BPG_ACCOUNTS_KEY = 'bpg_maths_academy_accounts_v2';
var BPG_STUDENT_SESSION_KEY = window.BPG_STUDENT_SESSION_KEY = 'bpg_academy_student_session_v1';
var BPG_PRIMARY_SYNC_CHANNEL = window.BPG_PRIMARY_SYNC_CHANNEL = 'bpg_academy_sync';
var BPG_SYNC_CHANNEL_NAME = window.BPG_SYNC_CHANNEL_NAME = 'bpg_maths_academy_live_sync';

/* BroadcastChannel instances for instant two-way synchronization */
let primarySyncChannel = null;
let syncChannel = null;
try {
    primarySyncChannel = new BroadcastChannel(BPG_PRIMARY_SYNC_CHANNEL);
} catch (e) {}
try {
    syncChannel = new BroadcastChannel(BPG_SYNC_CHANNEL_NAME);
} catch (e) {}

/* Built-In Mathematical SVG Diagrams */
const BPG_DIAGRAM_CIRCLE_TANGENT = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 240" width="520" height="240"><rect width="520" height="240" rx="10" fill="#FAF8F5"/><line x1="40" y1="130" x2="480" y2="130" stroke="#94A3B8" stroke-width="1.5"/><line x1="250" y1="20" x2="250" y2="225" stroke="#94A3B8" stroke-width="1.5"/><circle cx="250" cy="130" r="76" fill="rgba(30,58,138,0.06)" stroke="#1E3A8A" stroke-width="2.5"/><line x1="115" y1="28" x2="415" y2="178" stroke="#B45309" stroke-width="2.5"/><line x1="250" y1="130" x2="292" y2="67" stroke="#047857" stroke-width="2" stroke-dasharray="5,4"/><circle cx="250" cy="130" r="4" fill="#1E3A8A"/><circle cx="292" cy="67" r="4.5" fill="#B45309"/><text x="230" y="148" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#1C2430">O(0,0)</text><text x="276" y="106" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#047857">p = a</text><text x="302" y="64" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#B45309">P (Tangent Point: c² = a²(1+m²))</text><text x="140" y="210" font-family="Inter,sans-serif" font-size="12" fill="#475569">Circle: x² + y² = a²  |  Tangent Line: y = mx ± a√(1 + m²)</text></svg>`);

const BPG_DIAGRAM_FIRST_PRINCIPLE = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 230" width="520" height="230"><rect width="520" height="230" rx="10" fill="#FAF8F5"/><line x1="55" y1="190" x2="475" y2="190" stroke="#64748B" stroke-width="1.8"/><line x1="75" y1="205" x2="75" y2="25" stroke="#64748B" stroke-width="1.8"/><path d="M 90 170 Q 230 150 390 42" fill="none" stroke="#1E3A8A" stroke-width="3"/><line x1="135" y1="180" x2="415" y2="30" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="5,4"/><line x1="110" y1="175" x2="360" y2="85" stroke="#B45309" stroke-width="2.4"/><circle cx="185" cy="148" r="4.5" fill="#1E3A8A"/><circle cx="345" cy="70" r="4.5" fill="#047857"/><text x="150" y="140" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#1E3A8A">P(x, f(x))</text><text x="355" y="74" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#047857">Q(x+h, f(x+h))</text><text x="245" y="135" font-family="Inter,sans-serif" font-size="12" font-weight="bold" fill="#B45309">Tangent as h → 0</text></svg>`);

const DEFAULT_PUBLIC_DATA = {
    lastUpdated: new Date().toISOString(),
    notices: {
        tickerText: 'Class 11 & 12 Board Distinction Batches are now active. Free Sunday Masterclass opens at 6:30 AM NPT.'
    },
    faculty: {
        name: 'Bishnu Prasad Gautam',
        nickname: '(BPG Sir)',
        badgeText: 'Over 12+ Years of Senior Secondary Academic Leadership',
        portraitUrl: './images/bpg_sir.jpg',
        mottoHtml: 'Focus on the <strong class="glowing-concept-word">Concepts</strong> Rather Than the <strong>Problems</strong>.',
        whatsappNumber: '9779841000000',
        whatsappGreeting: 'Namaste BPG Sir, I have an academic inquiry regarding BPG Academy.'
    },
    calendarEvents: [
        {
            id: 'cal-c12-sun',
            portal: 'class-12',
            title: 'Sunday Concept Diagnostic & Live Q&A',
            type: 'batch',
            recurrenceLabel: 'Every Sunday',
            timings: '06:30 AM – 07:45 AM NPT',
            meetingId: '984 1023 8899',
            passcode: 'BPG2026',
            zoomUrl: 'https://zoom.us/j/98410238899?pwd=BPG2026',
            syllabus: 'Calculus first principles, integration without step loss, and live doubt resolution with BPG Sir.'
        },
        {
            id: 'cal-c12-sat',
            portal: 'class-12',
            title: 'Grade XII Calculus Distinction & Problem Bank Walkthrough',
            type: 'batch',
            recurrenceLabel: 'Every Saturday',
            timings: '7:00 PM – 8:30 PM NPT',
            meetingId: '984 1023 8899',
            passcode: 'BPG2026',
            zoomUrl: 'https://zoom.us/j/98410238899?pwd=BPG2026',
            syllabus: 'Differential equations, standard integrals, 3D vector planes, and NEB model exam analysis.'
        },
        {
            id: 'cal-c11-sun',
            portal: 'class-11',
            title: 'Grade XI Foundation & Mathematical Logic Workshop',
            type: 'batch',
            recurrenceLabel: 'Every Sunday',
            timings: '6:30 AM – 7:45 AM NPT',
            meetingId: '984 1023 8899',
            passcode: 'BPG2026',
            zoomUrl: 'https://zoom.us/j/98410238899?pwd=BPG2026',
            syllabus: 'Limits, continuity, first-principle derivatives, and analytical circles.'
        },
        {
            id: 'cal-c10-sat',
            portal: 'class-10',
            title: 'SEE Circle Theorems & Unseen Riders Clinic',
            type: 'batch',
            recurrenceLabel: 'Every Saturday',
            timings: '4:00 PM – 5:15 PM NPT',
            meetingId: '984 1023 8899',
            passcode: 'BPG2026',
            zoomUrl: 'https://zoom.us/j/98410238899?pwd=BPG2026',
            syllabus: 'Geometric circle theorem proofs, 3-set Venn diagrams, and optional math trigonometry.'
        },
        {
            id: 'cal-ent-daily',
            portal: 'after-12',
            title: 'IOE Pulchowk CBT Speed Calculus & Casio FX-991 Drill',
            type: 'batch',
            recurrenceLabel: 'Every Morning (Sun–Fri)',
            timings: '7:45 AM – 9:00 AM NPT',
            meetingId: '984 1023 8899',
            passcode: 'BPGIOE26',
            zoomUrl: 'https://zoom.us/j/98410238899?pwd=BPGIOE26',
            syllabus: '10-second MCQ elimination techniques, King’s property integrals, and Pulchowk past papers.'
        }
    ],
    announcements: [
        {
            id: 'ann-1',
            title: 'Strict Single-Class Dedicated Architecture Live',
            body: 'All workspaces now operate with dedicated single-class student accounts. All notes and Zoom sessions are completely open within your enrolled class.',
            tag: 'System Update',
            time: 'Just now',
            unread: true
        },
        {
            id: 'ann-2',
            title: 'Free Sunday Concept Diagnostic at 06:30 AM NPT',
            body: 'Join BPG Sir this Sunday on Zoom for open diagnostic problem-solving and live mathematical derivations.',
            tag: 'Live Lecture',
            time: 'Today',
            unread: true
        }
    ],
    portals: {
        'class-12': {
            curriculumHeader: 'NEB Official Specification Grid',
            gradeTitle: 'Grade XII Mathematics (Mat. 102)',
            description: 'Complete Grade XII mathematics preparation through conceptual explanations, worked examples, examination strategies and structured practice.',
            thumbUrl: 'images/thumb_c12.jpg',
            metaLessons: '2 lessons',
            metaNotes: '6 notes',
            metaLive: 'Saturday Live Batch',
            syllabusRows: [
                { code: 'Unit 01', name: 'Algebra (Permutations, Combinations, Binomial & Matrices)', hours: '28 hrs', marks: '15 Marks', focus: '1 Long (5M) + 2 Short (8M) + 2 MCQ (2M)' },
                { code: 'Unit 02', name: 'Trigonometry (Inverse Circular & Triangle Properties)', hours: '14 hrs', marks: '8 Marks', focus: '1 Long (5M) + 1 Short (2M) + 1 MCQ (1M)' },
                { code: 'Unit 03', name: 'Analytic Geometry (Conic Sections: Parabola, Ellipse & Hyperbola)', hours: '16 hrs', marks: '8 Marks', focus: '1 Long (5M) + 1 Short (2M) + 1 MCQ (1M)' },
                { code: 'Unit 04', name: 'Vectors & 3D Geometry (Plane in Space & Vector Cross Product)', hours: '20 hrs', marks: '14 Marks', focus: '1 Long (5M) + 3 Short (6M) + 3 MCQ (3M)' },
                { code: 'Unit 05', name: 'Calculus (Derivatives, Definite Integrals & Diff. Equations)', hours: '45 hrs', marks: '20 Marks', focus: '2 Long (10M) + 4 Short (8M) + 2 MCQ (2M)' },
                { code: 'Unit 06', name: 'Computational Methods (Simplex, Numerical & Statistics)', hours: '22 hrs', marks: '10 Marks', focus: '2 Short (8M) + 2 MCQ (2M)' }
            ],
            units: [
                {
                    code: 'UNIT 01',
                    title: 'Calculus & First-Principle Integration',
                    marks: '20 Marks',
                    topics: [
                        {
                            id: 'c12-u1-t1',
                            title: '1.1 Fundamental Theorem of Calculus & Standard Antiderivatives',
                            readTime: '15 min read',
                            badge: '20 Marks Total',
                            overview: `Integration is the analytical inverse of differentiation. For any continuous real function $f(x)$ over an interval $[a, b]$, the definite integral represents the signed area under the curve, defined rigorously by Riemann sums and the Fundamental Theorem of Calculus.`,
                            definitions: `$$\\int f(x)\\,dx = F(x) + C \\quad \\text{where } F'(x) = f(x)$$
$$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a) = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*)\\,\\Delta x$$`,
                            derivation: `By the Fundamental Theorem of Calculus: Let $A(x) = \\int_a^x f(t)\\,dt$. The derivative is given by the definition:
$$A'(x) = \\lim_{h \\to 0} \\frac{A(x+h) - A(x)}{h} = \\lim_{h \\to 0} \\frac{1}{h}\\int_x^{x+h} f(t)\\,dt = f(x).$$
Hence every continuous function possesses an antiderivative $F(x)$, and any two antiderivatives differ only by an arbitrary constant $C$.`,
                            example: `NEB 5-Mark Problem: Evaluate $\\int \\frac{dx}{x^2 - a^2}$.
Solution: Decomposing into partial fractions:
$$\\frac{1}{x^2 - a^2} = \\frac{1}{2a}\\left(\\frac{1}{x - a} - \\frac{1}{x + a}\\right)$$
Integrating term-by-term yields:
$$\\int \\frac{dx}{x^2 - a^2} = \\frac{1}{2a}\\ln\\left|\\frac{x - a}{x + a}\\right| + C.$$`,
                            pitfalls: `Omitting the arbitrary constant $+ C$ in indefinite integration forfeits the step mark automatically in NEB board evaluation! Always verify whether boundary conditions exist before removing $C$.`
                        }
                    ]
                },
                {
                    code: 'UNIT 02',
                    title: 'Conic Sections & Analytical Eccentricity',
                    marks: '8 Marks',
                    topics: [
                        {
                            id: 'c12-u2-t1',
                            title: '2.1 Parabola, Ellipse & Hyperbola Standard Locus Proofs',
                            readTime: '14 min read',
                            badge: '8 Marks Unit',
                            overview: `A conic section is the locus of a point $P(x, y)$ whose distance from a fixed focus $S$ is in constant ratio $e$ (eccentricity) to its perpendicular distance from a directrix line: $SP = e \\cdot PM$.`,
                            definitions: `$$\\text{Ellipse } (e < 1): \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad b^2 = a^2(1 - e^2)$$
$$\\text{Hyperbola } (e > 1): \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1, \\quad b^2 = a^2(e^2 - 1)$$`,
                            derivation: `Using focus $S(ae, 0)$ and directrix $x = a/e$, locus $SP^2 = e^2 PM^2$ gives $(x - ae)^2 + y^2 = e^2(x - a/e)^2 = (ex - a)^2$. Expanding and collecting terms gives $x^2(1 - e^2) + y^2 = a^2(1 - e^2)$, dividing through yields $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$.`,
                            example: `Find the eccentricity, foci and latus rectum of $9x^2 + 16y^2 = 144$.`,
                            pitfalls: `Always check whether $a^2 > b^2$ (major axis along x-axis) or $b^2 > a^2$ (major axis along y-axis) before writing foci coordinates!`
                        }
                    ]
                }
            ],
            notes: [
                { id: 'c12-n1', title: 'Class 12 Formula Cheat Sheet (PDF)', unit: 'All Core Units', pages: '34 Pages', fileSize: '2.8 MB', fileUrl: '' },
                { id: 'c12-n2', title: 'Calculus Distinction Board Model Solutions', unit: 'Unit 05: Calculus', pages: '56 Pages', fileSize: '4.5 MB', fileUrl: '' },
                { id: 'c12-n3', title: 'Conic Sections & 3D Vectors Summary Matrix', unit: 'Units 03 & 04', pages: '28 Pages', fileSize: '2.1 MB', fileUrl: '' },
                { id: 'c12-n4', title: '15-Year IOE Past Paper Solution Bank', unit: 'Entrance Practice', pages: '112 Pages', fileSize: '6.4 MB', fileUrl: '' }
            ]
        },

        'class-11': {
            curriculumHeader: 'NEB Official Specification Grid',
            gradeTitle: 'Grade XI Mathematics (Mat. 101)',
            description: 'Build strong mathematical foundations through clear explanations, logical problem-solving and systematic examination preparation.',
            thumbUrl: 'images/thumb_c11.jpg',
            metaLessons: '2 lessons',
            metaNotes: '6 notes',
            metaLive: 'Weekly Zoom Batch',
            syllabusRows: [
                { code: 'Unit 01', name: 'Logic, Set Theory & Real Number System', hours: '12 hrs', marks: '6 Marks', focus: '1 Short (4M) + 2 MCQ (2M)' },
                { code: 'Unit 02', name: 'Algebra & Matrices (Quadratics, Complex Numbers, Determinants)', hours: '32 hrs', marks: '15 Marks', focus: '1 Long (5M) + 2 Short (8M) + 2 MCQ (2M)' },
                { code: 'Unit 03', name: 'Trigonometry (General Solutions & Inverse Functions)', hours: '16 hrs', marks: '8 Marks', focus: '1 Long (5M) + 1 Short (2M) + 1 MCQ (1M)' },
                { code: 'Unit 04', name: 'Analytic Geometry (Pair of Straight Lines & Circle)', hours: '20 hrs', marks: '10 Marks', focus: '1 Long (5M) + 1 Short (4M) + 1 MCQ (1M)' },
                { code: 'Unit 05', name: 'Vectors (Scalar Product & Vector Algebra)', hours: '16 hrs', marks: '8 Marks', focus: '1 Short (4M) + 1 Short (2M) + 2 MCQ (2M)' },
                { code: 'Unit 06', name: 'Calculus (Limits, Continuity, First Principles & Integrals)', hours: '38 hrs', marks: '17 Marks', focus: '2 Long (10M) + 2 Short (5M) + 2 MCQ (2M)' },
                { code: 'Unit 07', name: 'Probability & Statistics (Skewness & Dispersion)', hours: '26 hrs', marks: '11 Marks', focus: '1 Long (5M) + 1 Short (4M) + 2 MCQ (2M)' }
            ],
            units: [
                {
                    code: 'UNIT 01',
                    title: 'Limits, Continuity & First-Principle Derivatives',
                    marks: '17 Marks',
                    topics: [
                        {
                            id: 'c11-u1-t1',
                            title: '1.1 Fundamental Trigonometric Limits & First Principles',
                            readTime: '14 min read',
                            badge: '17 Marks Core',
                            overview: `The derivative of a function $f(x)$ represents its instantaneous rate of change and is formally defined through the fundamental limit of a difference quotient as $h \\to 0$.`,
                            definitions: `$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
$$\\lim_{\\theta \\to 0} \\frac{\\sin\\theta}{\\theta} = 1 \\quad (\\theta \\text{ in radians})$$`,
                            derivation: `To prove $\\frac{d}{dx}(\\sin x) = \\cos x$ by First Principles:
$$f'(x) = \\lim_{h \\to 0} \\frac{\\sin(x+h) - \\sin x}{h} = \\lim_{h \\to 0} \\frac{2\\cos\\left(x + \\frac{h}{2}\\right)\\sin\\left(\\frac{h}{2}\\right)}{h} = \\lim_{h \\to 0} \\cos\\left(x + \\frac{h}{2}\\right) \\cdot \\lim_{h \\to 0} \\frac{\\sin(h/2)}{h/2} = \\cos x \\cdot 1 = \\cos x.$$`,
                            example: `Find the derivative of $f(x) = \\sqrt{x}$ from first principles.`,
                            pitfalls: `When evaluating trigonometric limits from first principles, always verify that the argument inside $\\sin$ matches the denominator before applying the standard limit value $1$.`
                        }
                    ]
                }
            ],
            notes: [
                { id: 'c11-n1', title: 'Grade XI NEB Core Formula Cheat Sheet', unit: 'Full Curriculum', pages: '32 Pages', fileSize: '2.5 MB', fileUrl: '' },
                { id: 'c11-n2', title: 'Class 11 Limits & First Principles Master Bank', unit: 'Unit 06: Calculus', pages: '44 Pages', fileSize: '3.6 MB', fileUrl: '' }
            ]
        },

        'class-10': {
            curriculumHeader: 'CDC SEE Specification Grid',
            gradeTitle: 'Class 10 (SEE Mathematics Foundation)',
            description: 'Strengthen mathematical fundamentals through algebra, geometry, trigonometry, coordinate geometry and examination-focused practice.',
            thumbUrl: 'images/thumb_c10.jpg',
            metaLessons: '2 lessons',
            metaNotes: '6 notes',
            metaLive: 'Sunday Open Clinic',
            syllabusRows: [
                { code: 'Unit 01', name: 'Sets, Venn Diagrams & Cardinality Applications', hours: '12 hrs', marks: '6 Marks', focus: '1 Full Set Problem (4M + 2M)' },
                { code: 'Unit 02', name: 'Arithmetic (Compound Interest & Money Exchange)', hours: '24 hrs', marks: '13 Marks', focus: '3 Structured Problems' },
                { code: 'Unit 03', name: 'Mensuration (Prisms, Pyramids, Cones & Solids)', hours: '24 hrs', marks: '13 Marks', focus: '2 Structured + 1 High-Order Rider' },
                { code: 'Unit 04', name: 'Algebra (Indices, Expressions & Quadratics)', hours: '30 hrs', marks: '15 Marks', focus: 'Simplification + Word Problem' },
                { code: 'Unit 05', name: 'Geometry (Circle Theorems & Unseen Riders)', hours: '28 hrs', marks: '13 Marks', focus: 'Theoretical Proof + Unseen Rider' },
                { code: 'Unit 06', name: 'Trigonometry & Statistics (Heights & Distances, Quartiles)', hours: '26 hrs', marks: '15 Marks', focus: 'Elevation/Depression + Median/Ogive' }
            ],
            units: [
                {
                    code: 'UNIT 01',
                    title: 'Circle Theorems & Unseen Geometric Riders',
                    marks: '13 Marks',
                    topics: [
                        {
                            id: 'c10-u1-t1',
                            title: '1.1 Central Angle vs Inscribed Angle Theorem',
                            readTime: '12 min read',
                            badge: 'SEE 4-Mark Staple',
                            overview: `The central angle subtended by an arc at the center of a circle is double the angle subtended by it at any point on the remaining circumference.`,
                            definitions: `$$\\angle AOB = 2\\angle ACB \\quad (\\text{Standing on the same arc } AB)$$
$$\\angle ADB = \\angle ACB \\quad (\\text{Inscribed angles on the same arc})$$`,
                            derivation: `In $\\triangle OAC$, since $OA = OC = r$, $\\triangle OAC$ is isosceles, so $\\angle OCA = \\angle OAC$. By the exterior angle theorem, the exterior angle at $O$ is $2\\angle OCA$. Repeating for $\\triangle OBC$ establishes $\\angle AOB = 2\\angle ACB$.`,
                            example: `Prove that angles in the same segment of a circle are equal.`,
                            pitfalls: `In SEE 2-column proofs, always write the exact CDC theorem reason in brackets for every single statement step!`
                        }
                    ]
                }
            ],
            notes: [
                { id: 'c10-n1', title: 'Class 10 SEE Complete Circle Theorem Guide', unit: 'Unit 05: Geometry', pages: '26 Pages', fileSize: '2.9 MB', fileUrl: '' },
                { id: 'c10-n2', title: 'SEE Compulsory & Optional Math Model Sets', unit: 'Full Model Sets', pages: '48 Pages', fileSize: '3.8 MB', fileUrl: '' }
            ]
        },

        'after-12': {
            curriculumHeader: 'IOE Pulchowk CBT Blueprint (50 Marks)',
            gradeTitle: 'After 12 Entrance (IOE / CEE / KU)',
            description: 'Prepare for IOE, CEE and KU entrance examinations through past questions, calculation techniques, time management and examination strategies.',
            thumbUrl: 'images/thumb_entrance.jpg',
            metaLessons: '2 lessons',
            metaNotes: '6 notes',
            metaLive: 'Daily Ranker Batch',
            syllabusRows: [
                { code: 'IOE-01', name: 'Calculus (Limits, Derivatives, Definite Integrals & Area)', hours: '36 hrs', marks: '16 Marks', focus: '10×1M + 3×2M CBT MCQs (-0.25 Neg. Marking)' },
                { code: 'IOE-02', name: 'Coordinate Geometry (Lines, Circle, Conics & 3D Planes)', hours: '28 hrs', marks: '10 Marks', focus: '6×1M + 2×2M CBT MCQs (-0.25 Neg. Marking)' },
                { code: 'IOE-03', name: 'Algebra & Matrices (Complex, Quadratic, Binomial & Series)', hours: '28 hrs', marks: '12 Marks', focus: '8×1M + 2×2M CBT MCQs (-0.25 Neg. Marking)' },
                { code: 'IOE-04', name: 'Trigonometry (Inverse Circular & Conditional Identities)', hours: '16 hrs', marks: '6 Marks', focus: '4×1M + 1×2M CBT MCQs (-0.25 Neg. Marking)' },
                { code: 'IOE-05', name: 'Vectors & 3D (Dot/Cross Product & Skew Lines)', hours: '16 hrs', marks: '6 Marks', focus: '4×1M + 1×2M CBT MCQs (-0.25 Neg. Marking)' }
            ],
            units: [
                {
                    code: 'UNIT 01',
                    title: 'Calculus Speed Hacks & Pulchowk Past MCQs',
                    marks: '16 Marks',
                    topics: [
                        {
                            id: 'ent-u1-t1',
                            title: '1.1 10-Second Limit & Definite Integral Shortcuts',
                            readTime: '14 min read',
                            badge: 'IOE Staple',
                            overview: `In IOE CBT exams, combining Maclaurin 3-term series approximations with King's definite integral symmetry evaluates integrals and limits in under 10 seconds.`,
                            definitions: `$$\\int_a^b \\frac{f(x)}{f(x) + f(a+b-x)}\\,dx = \\frac{b - a}{2}$$
$$\\text{Area between } y^2 = 4ax \\text{ and } y = mx: \\quad A = \\frac{8a^2}{3m^3}$$`,
                            derivation: `Let $I = \\int_a^b \\frac{f(x)}{f(x)+f(a+b-x)}dx$. Applying property $x \\to a+b-x$ gives $I = \\int_a^b \\frac{f(a+b-x)}{f(a+b-x)+f(x)}dx$. Adding both equations gives $2I = \\int_a^b 1\\,dx = b - a \\implies I = \\frac{b-a}{2}$.`,
                            example: `Evaluate $\\int_{\\pi/6}^{\\pi/3} \\frac{dx}{1 + \\sqrt{\\tan x}}$ in 5 seconds. Answer: $(\\pi/3 - \\pi/6)/2 = \\pi/12$.`,
                            pitfalls: `IOE CBT penalizes $10\\%$ ($-0.25$ marks) for incorrect options. Verify whether the function is odd on $[-a, a]$ before guessing!`
                        }
                    ]
                }
            ],
            notes: [
                { id: 'ent-n1', title: '15-Year Solved IOE Pulchowk Mathematics Archive', unit: 'All 5 Domains', pages: '112 Pages', fileSize: '6.4 MB', fileUrl: '' },
                { id: 'ent-n2', title: 'Casio FX-991ES/CW 10-Second MCQ Speed Manual', unit: 'Speed Hacks', pages: '42 Pages', fileSize: '3.1 MB', fileUrl: '' }
            ]
        }
    }
};

/* State Normalization */
function normalizeAcademyState(state) {
    if (!state || typeof state !== 'object') {
        state = JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA));
    }
    if (!state.notices || typeof state.notices !== 'object') {
        state.notices = JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA.notices));
    }
    if (!state.portals || typeof state.portals !== 'object') {
        state.portals = {};
    }
    if (!Array.isArray(state.calendarEvents) || state.calendarEvents.length === 0) {
        state.calendarEvents = JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA.calendarEvents));
    }

    state.courses = state.courses || {};
    ['class-10', 'class-11', 'class-12', 'after-12'].forEach(k => {
        const defPortal = DEFAULT_PUBLIC_DATA.portals[k];
        if (!state.portals[k]) {
            state.portals[k] = JSON.parse(JSON.stringify(defPortal));
        } else {
            const p = state.portals[k];
            if (!Array.isArray(p.syllabusRows) || p.syllabusRows.length === 0) {
                p.syllabusRows = JSON.parse(JSON.stringify(defPortal.syllabusRows || []));
            }
            if (!Array.isArray(p.units) || p.units.length === 0) {
                p.units = JSON.parse(JSON.stringify(defPortal.units || []));
            }
            if (!p.gradeTitle) p.gradeTitle = defPortal.gradeTitle;
            if (!p.curriculumHeader) p.curriculumHeader = defPortal.curriculumHeader;
        }
        const portalRef = state.portals[k];
        portalRef.blueprint = portalRef.syllabusRows;
        portalRef.theory = portalRef.units;
        portalRef.liveSchedule = (state.calendarEvents || []).filter(ev => ev.portal === k || ev.portal === 'all');
        state.courses[k] = portalRef;
    });

    if (!state.faculty) {
        state.faculty = JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA.faculty));
    }
    return state;
}

function getNormalizedPortalNotes(classKey) {
    const pData = ACADEMY_STATE.portals?.[classKey] || DEFAULT_PUBLIC_DATA.portals?.[classKey] || {};
    const rawNotes = Array.isArray(pData.notesPdfs)
        ? pData.notesPdfs
        : (Array.isArray(pData.notes) ? pData.notes : (DEFAULT_PUBLIC_DATA.portals?.[classKey]?.notes || []));
    return rawNotes.map(n => ({
        id: n.id,
        title: n.title || 'Official Mathematics Resource',
        unit: n.category || n.unit || 'Complete Chapter Revision Cheat Sheet',
        pages: n.pages || '28 Pages',
        fileSize: n.size || n.fileSize || '2.5 MB',
        badgeClass: 'free',
        type: 'Class Resource',
        fileUrl: (n.url && n.url !== '#') ? n.url : (n.fileUrl || '')
    }));
}

function loadPublicPortalState() {
    try {
        const rawPrimary = localStorage.getItem(BPG_MASTER_DB_PRIMARY) || localStorage.getItem(BPG_MASTER_DB_KEY);
        if (rawPrimary) {
            const parsed = JSON.parse(rawPrimary);
            if (parsed && parsed.portals) return normalizeAcademyState(parsed);
        }
        const rawLegacy = localStorage.getItem(BPG_STORAGE_KEY);
        if (rawLegacy) {
            const parsed = JSON.parse(rawLegacy);
            if (parsed && parsed.portals) {
                const norm = normalizeAcademyState(parsed);
                try {
                    const s = JSON.stringify(norm);
                    localStorage.setItem(BPG_MASTER_DB_PRIMARY, s);
                    localStorage.setItem(BPG_MASTER_DB_KEY, s);
                } catch (e) {}
                return norm;
            }
        }
    } catch (e) {}
    const seeded = normalizeAcademyState(JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA)));
    try {
        const serialized = JSON.stringify(seeded);
        localStorage.setItem(BPG_MASTER_DB_PRIMARY, serialized);
        localStorage.setItem(BPG_MASTER_DB_KEY, serialized);
        localStorage.setItem(BPG_STORAGE_KEY, serialized);
    } catch (e) {}
    return seeded;
}

let ACADEMY_STATE = loadPublicPortalState();

function loadStateFromStorage() {
    ACADEMY_STATE = loadPublicPortalState();
    return ACADEMY_STATE;
}

function renderActivePortal() {
    if (typeof renderEntireStudentPortal === 'function') renderEntireStudentPortal();
}

function showToastNotification(msg) {
    if (typeof showToast === 'function') showToast(msg);
}

window.loadStateFromStorage = loadStateFromStorage;
window.renderActivePortal = renderActivePortal;
window.showToastNotification = showToastNotification;

function applyIncomingAdminState(remote) {
    if (!remote || typeof remote !== 'object') return;
    const prevPortals = ACADEMY_STATE.portals || {};
    Object.assign(ACADEMY_STATE, remote);
    if (remote.portals && typeof remote.portals === 'object') {
        ACADEMY_STATE.portals = Object.assign({}, prevPortals);
        ['class-10', 'class-11', 'class-12', 'after-12'].forEach(k => {
            const defP = DEFAULT_PUBLIC_DATA.portals[k] || {};
            const oldP = prevPortals[k] || {};
            const incP = remote.portals[k] || {};
            const isLocked = Boolean(incP.sectionLocked || remote.sectionLocks?.[k]?.locked);
            const merged = Object.assign({}, defP, oldP, incP);
            if (isLocked) {
                merged.sectionLocked = true;
                merged.lockReason = incP.lockReason || remote.sectionLocks?.[k]?.reason || 'Temporarily unavailable';
                merged.units = [];
                merged.notes = [];
                merged.notesPdfs = [];
                merged.syllabusRows = [];
            } else {
                merged.sectionLocked = false;
                if (!Array.isArray(incP.syllabusRows) || incP.syllabusRows.length === 0) {
                    merged.syllabusRows = oldP.syllabusRows || defP.syllabusRows || [];
                }
                if (Array.isArray(incP.notesPdfs)) {
                    merged.notesPdfs = incP.notesPdfs;
                    merged.notes = incP.notesPdfs;
                } else if (Array.isArray(incP.notes)) {
                    merged.notes = incP.notes;
                    merged.notesPdfs = incP.notes;
                }
            }
            ACADEMY_STATE.portals[k] = merged;
        });
    }
    if (remote.sectionLocks && typeof remote.sectionLocks === 'object') {
        ACADEMY_STATE.sectionLocks = Object.assign({}, DEFAULT_SECTION_LOCKS_CLIENT, remote.sectionLocks);
    }
    if (remote.plansConfig && typeof remote.plansConfig === 'object') {
        ACADEMY_STATE.plansConfig = Object.assign({}, DEFAULT_PLANS_CONFIG_CLIENT, remote.plansConfig);
    }
    normalizeAcademyState(ACADEMY_STATE);
    try {
        const serialized = JSON.stringify(ACADEMY_STATE);
        localStorage.setItem(BPG_MASTER_DB_PRIMARY, serialized);
        localStorage.setItem(BPG_MASTER_DB_KEY, serialized);
        localStorage.setItem(BPG_STORAGE_KEY, serialized);
    } catch (e) {}
    if (typeof syncSectionLockBadges === 'function') syncSectionLockBadges();
    if (typeof renderEntireStudentPortal === 'function') renderEntireStudentPortal();
}

const DEFAULT_SECTION_LOCKS_CLIENT = {
    'class-10': { locked: true, reason: 'Temporarily unavailable' },
    'class-11': { locked: false, reason: '' },
    'class-12': { locked: false, reason: '' },
    'after-12': { locked: true, reason: 'Temporarily unavailable' }
};

const DEFAULT_PLANS_CONFIG_CLIENT = {
    free: { id: 'free', name: 'Free', price: 'Rs. 0', period: 'Forever free', description: 'Access admin-selected sample questions and PDFs in open sections.' },
    gold: { id: 'gold', name: 'Gold', price: 'Rs. 1,499', period: 'Per academic year', description: 'Includes all Free content plus Gold questions, full answers, and study PDFs.' },
    diamond: { id: 'diamond', name: 'Diamond', price: 'Rs. 2,999', period: 'Per academic year', description: 'Unlocks every question, solution, and PDF across all open sections.' }
};

function getSectionLockInfo(classKey) {
    const map = { c10: 'class-10', c11: 'class-11', c12: 'class-12', entrance: 'after-12' };
    const norm = map[classKey] || classKey;
    const locks = ACADEMY_STATE.sectionLocks || DEFAULT_SECTION_LOCKS_CLIENT;
    const info = locks[norm] || DEFAULT_SECTION_LOCKS_CLIENT[norm] || { locked: false, reason: '' };
    return {
        locked: Boolean(info.locked),
        reason: info.reason || 'Temporarily unavailable'
    };
}

function isSectionLocked(classKey) {
    return getSectionLockInfo(classKey).locked;
}

function getPlansConfig() {
    return Object.assign({}, DEFAULT_PLANS_CONFIG_CLIENT, ACADEMY_STATE.plansConfig || {});
}

function getStudentAuthHeaders() {
    const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    try {
        const raw = localStorage.getItem(BPG_STUDENT_SESSION_KEY) || localStorage.getItem('bpg_student_session');
        if (raw) {
            const s = JSON.parse(raw);
            if (s.sessionToken) headers['x-session-token'] = s.sessionToken;
            if (s.email) headers['x-student-email'] = s.email;
        }
    } catch (e) {}
    return headers;
}

async function syncWithServerDatabase() {
    try {
        const res = await fetch('/api/academy-state?_t=' + Date.now(), {
            cache: 'no-store',
            headers: getStudentAuthHeaders()
        });
        if (res.ok) {
            const payload = await res.json();
            if (payload && payload.data && payload.data.portals) {
                applyIncomingAdminState(payload.data);
                return true;
            }
        }
    } catch (err) {}
    return false;
}

let isAuthenticated = false;
let currentActiveTopic = {
    'class-10': 'c10-u1-t1',
    'class-11': 'c11-u1-t1',
    'class-12': 'c12-u1-t1',
    'after-12': 'ent-u1-t1'
};

function getByPath(obj, pathStr) {
    return pathStr.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
}

function computeSyllabusTotals(rows) {
    let totalHours = 0;
    let totalMarks = 0;
    (rows || []).forEach(r => {
        const hMatch = String(r.hours || '').match(/(\d+(\.\d+)?)/);
        const mMatch = String(r.marks || '').match(/(\d+(\.\d+)?)/);
        if (hMatch) totalHours += parseFloat(hMatch[1]);
        if (mMatch) totalMarks += parseFloat(mMatch[1]);
    });
    return { totalHours, totalMarks };
}

function formatRichMarkdown(text) {
    if (!text) return '';
    let html = String(text);

    // 1. Inline Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, cap, src) => {
        const cleanCap = cap.trim();
        return `<figure class="inline-math-figure align-center">
            <img src="${src.trim()}" alt="${cleanCap.replace(/"/g, '&quot;')}" loading="lazy">
            ${cleanCap ? `<figcaption>${cleanCap}</figcaption>` : ''}
        </figure>`;
    });

    // 2. Red-Pen Trap Box
    html = html.replace(/\[TRAP:([^\]]+)\]/g, (_, body) => {
        return `<div class="inline-trap-callout callout-trap red-pen-alert"><strong><i class="fa-solid fa-pen-fancy"></i> BPG Sir Red-Pen Exam Trap:</strong> ${body.trim()}</div>`;
    });
    html = html.replace(/^>\s*⚠️\s*(.+)$/gm, (_, body) => {
        return `<div class="inline-trap-callout callout-trap red-pen-alert"><i class="fa-solid fa-pen-fancy"></i> ${body.trim()}</div>`;
    });

    // 3. Bold, Italic & Paragraphs
    return html
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/\n\n/g, '<br><br>');
}

function renderMathSafely(containerEl) {
    if (window.renderMathInElement && containerEl) {
        renderMathInElement(containerEl, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    }
}
