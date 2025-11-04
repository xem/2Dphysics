const CollisionGroups = {
    GROUP0: { id: 1 << 0, name: "GROUP0"},
    GROUP1: { id: 1 << 1, name: "GROUP1"},
    GROUP2: { id: 1 << 2, name: "GROUP2"},
    GROUP3: { id: 1 << 3, name: "GROUP3"},

    GROUP4: { id: 1 << 4, name: "GROUP4"},
    GROUP5: { id: 1 << 5, name: "GROUP5"},
    GROUP6: { id: 1 << 6, name: "GROUP6"},
    GROUP7: { id: 1 << 7, name: "GROUP7"},
}

// 1111 1111 / 256
DEFAULT_COLLISION = 
    CollisionGroups.GROUP0.id | 
    CollisionGroups.GROUP1.id | 
    CollisionGroups.GROUP2.id | 
    CollisionGroups.GROUP3.id | 
    CollisionGroups.GROUP4.id | 
    CollisionGroups.GROUP5.id | 
    CollisionGroups.GROUP6.id | 
    CollisionGroups.GROUP7.id;


const CollisionMatrix = {
    [CollisionGroups.GROUP0.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP1.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP2.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP3.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP4.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP5.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP6.id] : DEFAULT_COLLISION,
    [CollisionGroups.GROUP7.id] : DEFAULT_COLLISION
}
