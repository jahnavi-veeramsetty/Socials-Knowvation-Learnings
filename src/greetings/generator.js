const adminPositive = {
    morning: [
        "Morning, boss. Empire awaits.",
        "Good morning, Chief.",
        "Boss mode activated.",
        "The team survived another night.",
        "Morning. Everyone's waiting for you."
    ],
    afternoon: [
        "Afternoon, boss. Looking powerful.",
        "Still carrying the team, huh?",
        "The kingdom is running smoothly.",
        "Afternoon, Chief.",
        "Boss energy detected."
    ],
    evening: [
        "Good evening, boss.",
        "Time to log off, I guess?.",
        "The internet survived today.",
        "Another successful day, boss.",
        "Go rest. You've earned it."
    ]
};

const memberRoasts = {
    morning: [
        "Morning. Try not to mess up.",
        "The undo button is ready.",
        "Mistakes are expected.",
        "Keep the typos low today.",
        "Morning. Expectations are moderate."
    ],
    afternoon: [
        "Working or just clicking around?",
        "Any actual progress today?",
        "Still researching instead of working?",
        "Productivity called. Missed you.",
        "The deadline remembers you."
    ],
    evening: [
        "Finished work or pretending?",
        "Time to stop breaking things.",
        "Another day, another excuse.",
        "Good evening, rookie.",
        "The bugs thank you."
    ]
};

export const getGreeting = (role, currentUserName, teamMembers = []) => {
    const hour = new Date().getHours();

    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
    } else if (hour >= 17) {
        timeOfDay = 'evening';
    }

    const isAdmin =
        role === 'admin' ||
        role === 'owner' ||
        role === 'super admin';

    const greetingsList = isAdmin
        ? adminPositive[timeOfDay]
        : memberRoasts[timeOfDay];

    let greeting =
        greetingsList[Math.floor(Math.random() * greetingsList.length)];

    const otherMembers = teamMembers.filter(
        m => m.name !== currentUserName && m.name
    );

    if (otherMembers.length > 0 && Math.random() > 0.7) {
        const randomMember =
            otherMembers[Math.floor(Math.random() * otherMembers.length)].name;

        const adminGossip = [
            ` ${randomMember} thinks you're unstoppable.`,
            ` ${randomMember} wants your chair.`,
            ` ${randomMember} is watching, boss.`,
            ` ${randomMember} says you're the GOAT.`
        ];

        const memberGossip = [
            ` ${randomMember} is outworking you.`,
            ` ${randomMember} noticed that typo.`,
            ` ${randomMember} is catching up.`,
            ` ${randomMember} thinks you need more coffee.`
        ];

        const gossipList = isAdmin ? adminGossip : memberGossip;

        greeting +=
            gossipList[Math.floor(Math.random() * gossipList.length)];
    }

    return greeting;
};