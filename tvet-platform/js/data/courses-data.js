// Courses Data

export const coursesData = [
    // Welding Courses
    {
        id: 'welding-001',
        title: 'Welding Fundamentals',
        slug: 'welding-fundamentals',
        description: 'Master the basics of welding including safety, equipment, and fundamental techniques for beginners.',
        trade: 'welding',
        level: 'beginner',
        duration: '3 hours',
        price: '$49',
        rating: 4.8,
        reviews: 1247,
        thumbnail: 'assets/images/courses/welding-fundamentals.jpg',
        instructor: 'Mike Rodriguez',
        instructorId: 'instructor-001',
        modules: [
            'Safety Protocols and PPE',
            'Welding Equipment Overview',
            'Basic Arc Welding Techniques',
            'Reading Welding Blueprints',
            'Hands-on Practice Session'
        ],
        skills: ['Arc Welding', 'Safety Protocols', 'Blueprint Reading'],
        certificate: true,
        prerequisites: [],
        featured: true
    },
    {
        id: 'welding-002',
        title: 'Advanced MIG Welding',
        slug: 'advanced-mig-welding',
        description: 'Advanced techniques for MIG welding including aluminum, stainless steel, and complex joint configurations.',
        trade: 'welding',
        level: 'advanced',
        duration: '5 hours',
        price: '$89',
        rating: 4.9,
        reviews: 892,
        thumbnail: 'assets/images/courses/mig-welding-advanced.jpg',
        instructor: 'Sarah Chen',
        instructorId: 'instructor-002',
        modules: [
            'MIG Welding Theory',
            'Gas Selection and Flow Rates',
            'Aluminum Welding Techniques',
            'Stainless Steel Applications',
            'Quality Control and Testing'
        ],
        skills: ['MIG Welding', 'Aluminum Welding', 'Quality Control'],
        certificate: true,
        prerequisites: ['welding-001'],
        featured: false
    },
    
    // Electrical Courses
    {
        id: 'electrical-001',
        title: 'Electrical Basics & Safety',
        slug: 'electrical-basics',
        description: 'Essential electrical knowledge covering circuits, safety protocols, and basic wiring techniques.',
        trade: 'electrical',
        level: 'beginner',
        duration: '4 hours',
        price: '$59',
        rating: 4.7,
        reviews: 1563,
        thumbnail: 'assets/images/courses/electrical-basics.jpg',
        instructor: 'James Wilson',
        instructorId: 'instructor-003',
        modules: [
            'Electrical Safety Fundamentals',
            'Understanding Electrical Circuits',
            'Basic Wiring Techniques',
            'Using Electrical Tools',
            'Code Compliance Basics'
        ],
        skills: ['Electrical Safety', 'Circuit Analysis', 'Basic Wiring'],
        certificate: true,
        prerequisites: [],
        featured: true
    },
    {
        id: 'electrical-002',
        title: 'Residential Wiring Systems',
        slug: 'residential-wiring',
        description: 'Comprehensive guide to residential electrical systems, panel installation, and home wiring projects.',
        trade: 'electrical',
        level: 'intermediate',
        duration: '6 hours',
        price: '$99',
        rating: 4.8,
        reviews: 1034,
        thumbnail: 'assets/images/courses/residential-wiring.jpg',
        instructor: 'Lisa Martinez',
        instructorId: 'instructor-004',
        modules: [
            'Residential Electrical Codes',
            'Panel Box Installation',
            'Outlet and Switch Wiring',
            'Lighting Circuits',
            'Troubleshooting Common Issues'
        ],
        skills: ['Residential Wiring', 'Panel Installation', 'Code Compliance'],
        certificate: true,
        prerequisites: ['electrical-001'],
        featured: true
    },
    
    // Plumbing Courses
    {
        id: 'plumbing-001',
        title: 'Plumbing Essentials',
        slug: 'plumbing-essentials',
        description: 'Learn fundamental plumbing skills including pipe fitting, basic repairs, and system understanding.',
        trade: 'plumbing',
        level: 'beginner',
        duration: '3.5 hours',
        price: '$55',
        rating: 4.6,
        reviews: 987,
        thumbnail: 'assets/images/courses/plumbing-essentials.jpg',
        instructor: 'Robert Thompson',
        instructorId: 'instructor-005',
        modules: [
            'Plumbing System Overview',
            'Pipe Types and Materials',
            'Basic Pipe Fitting',
            'Common Repair Techniques',
            'Tools and Equipment'
        ],
        skills: ['Pipe Fitting', 'System Diagnosis', 'Basic Repairs'],
        certificate: true,
        prerequisites: [],
        featured: false
    },
    {
        id: 'plumbing-002',
        title: 'Advanced Pipe Installation',
        slug: 'advanced-pipe-installation',
        description: 'Master complex pipe installation techniques for commercial and residential applications.',
        trade: 'plumbing',
        level: 'advanced',
        duration: '7 hours',
        price: '$129',
        rating: 4.9,
        reviews: 654,
        thumbnail: 'assets/images/courses/pipe-installation.jpg',
        instructor: 'Maria Garcia',
        instructorId: 'instructor-006',
        modules: [
            'Complex Pipe Routing',
            'Commercial Installation Standards',
            'Pressure Testing Methods',
            'Code Compliance',
            'Project Management'
        ],
        skills: ['Advanced Installation', 'Pressure Testing', 'Project Management'],
        certificate: true,
        prerequisites: ['plumbing-001'],
        featured: false
    },
    
    // HVAC Courses
    {
        id: 'hvac-001',
        title: 'HVAC Systems Overview',
        slug: 'hvac-systems',
        description: 'Comprehensive introduction to heating, ventilation, and air conditioning systems and components.',
        trade: 'hvac',
        level: 'beginner',
        duration: '4.5 hours',
        price: '$69',
        rating: 4.7,
        reviews: 1123,
        thumbnail: 'assets/images/courses/hvac-systems.jpg',
        instructor: 'David Lee',
        instructorId: 'instructor-007',
        modules: [
            'HVAC System Components',
            'Heating System Basics',
            'Cooling System Fundamentals',
            'Ventilation Principles',
            'Energy Efficiency Concepts'
        ],
        skills: ['System Analysis', 'Component Identification', 'Energy Efficiency'],
        certificate: true,
        prerequisites: [],
        featured: true
    },
    {
        id: 'hvac-002',
        title: 'Refrigeration Fundamentals',
        slug: 'refrigeration-fundamentals',
        description: 'Deep dive into refrigeration cycles, components, and troubleshooting techniques.',
        trade: 'hvac',
        level: 'intermediate',
        duration: '5.5 hours',
        price: '$89',
        rating: 4.8,
        reviews: 789,
        thumbnail: 'assets/images/courses/refrigeration.jpg',
        instructor: 'Jennifer Brown',
        instructorId: 'instructor-008',
        modules: [
            'Refrigeration Cycle Theory',
            'Compressor Types and Operation',
            'Refrigerant Handling',
            'System Diagnostics',
            'Maintenance Procedures'
        ],
        skills: ['Refrigeration Theory', 'System Diagnostics', 'Maintenance'],
        certificate: true,
        prerequisites: ['hvac-001'],
        featured: false
    },
    
    // Carpentry Courses
    {
        id: 'carpentry-001',
        title: 'Carpentry Fundamentals',
        slug: 'carpentry-fundamentals',
        description: 'Essential carpentry skills including tool usage, measuring, cutting, and basic joinery techniques.',
        trade: 'carpentry',
        level: 'beginner',
        duration: '4 hours',
        price: '$59',
        rating: 4.6,
        reviews: 1456,
        thumbnail: 'assets/images/courses/carpentry-fundamentals.jpg',
        instructor: 'Tom Anderson',
        instructorId: 'instructor-009',
        modules: [
            'Carpentry Tools Overview',
            'Measuring and Marking',
            'Cutting Techniques',
            'Basic Joinery Methods',
            'Safety in the Workshop'
        ],
        skills: ['Tool Usage', 'Precision Measuring', 'Basic Joinery'],
        certificate: true,
        prerequisites: [],
        featured: false
    },
    {
        id: 'carpentry-002',
        title: 'Cabinet Making Essentials',
        slug: 'cabinet-making',
        description: 'Learn professional cabinet making techniques from design to finishing.',
        trade: 'carpentry',
        level: 'intermediate',
        duration: '8 hours',
        price: '$149',
        rating: 4.9,
        reviews: 567,
        thumbnail: 'assets/images/courses/cabinet-making.jpg',
        instructor: 'Susan Miller',
        instructorId: 'instructor-010',
        modules: [
            'Cabinet Design Principles',
            'Material Selection',
            'Precision Cutting and Assembly',
            'Hardware Installation',
            'Finishing Techniques'
        ],
        skills: ['Cabinet Design', 'Precision Assembly', 'Finishing'],
        certificate: true,
        prerequisites: ['carpentry-001'],
        featured: true
    },
    
    // Automotive Courses
    {
        id: 'automotive-001',
        title: 'Automotive Repair Basics',
        slug: 'automotive-repair',
        description: 'Essential automotive repair skills covering engine basics, diagnostics, and common maintenance.',
        trade: 'automotive',
        level: 'beginner',
        duration: '5 hours',
        price: '$79',
        rating: 4.7,
        reviews: 1789,
        thumbnail: 'assets/images/courses/automotive-repair.jpg',
        instructor: 'Carlos Rodriguez',
        instructorId: 'instructor-011',
        modules: [
            'Engine Components Overview',
            'Basic Diagnostic Techniques',
            'Fluid Systems Maintenance',
            'Brake System Basics',
            'Electrical System Fundamentals'
        ],
        skills: ['Engine Diagnostics', 'Brake Systems', 'Electrical Basics'],
        certificate: true,
        prerequisites: [],
        featured: true
    },
    {
        id: 'automotive-002',
        title: 'Advanced Engine Diagnostics',
        slug: 'engine-diagnostics',
        description: 'Advanced diagnostic techniques using modern tools and computer systems.',
        trade: 'automotive',
        level: 'advanced',
        duration: '6 hours',
        price: '$119',
        rating: 4.8,
        reviews: 892,
        thumbnail: 'assets/images/courses/engine-diagnostics.jpg',
        instructor: 'Michael Chang',
        instructorId: 'instructor-012',
        modules: [
            'OBD-II System Analysis',
            'Advanced Diagnostic Tools',
            'Engine Performance Testing',
            'Emission System Diagnostics',
            'Computer System Integration'
        ],
        skills: ['OBD-II Analysis', 'Performance Testing', 'Computer Diagnostics'],
        certificate: true,
        prerequisites: ['automotive-001'],
        featured: false
    }
];

// Helper functions for course data
export const getCourseById = (id) => {
    return coursesData.find(course => course.id === id);
};

export const getCoursesByTrade = (trade) => {
    return coursesData.filter(course => course.trade === trade);
};

export const getCoursesByLevel = (level) => {
    return coursesData.filter(course => course.level === level);
};

export const getFeaturedCourses = () => {
    return coursesData.filter(course => course.featured);
};

export const searchCourses = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return coursesData.filter(course => 
        course.title.toLowerCase().includes(lowercaseQuery) ||
        course.description.toLowerCase().includes(lowercaseQuery) ||
        course.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)) ||
        course.trade.toLowerCase().includes(lowercaseQuery)
    );
};

export const getTradeCategories = () => {
    const trades = [...new Set(coursesData.map(course => course.trade))];
    return trades.map(trade => ({
        value: trade,
        label: trade.charAt(0).toUpperCase() + trade.slice(1),
        count: coursesData.filter(course => course.trade === trade).length
    }));
};

export const getLevelCategories = () => {
    const levels = [...new Set(coursesData.map(course => course.level))];
    return levels.map(level => ({
        value: level,
        label: level.charAt(0).toUpperCase() + level.slice(1),
        count: coursesData.filter(course => course.level === level).length
    }));
};

