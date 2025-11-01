const CollisionGroups = {
    GROUP0 : 1 << 0, // 0000 0001 
    GROUP1 : 1 << 1, // 0000 0010 
    GROUP2 : 1 << 2, // 0000 0100
    GROUP3 : 1 << 3, // 0000 1000 
    GROUP4 : 1 << 4, // 0001 0000
    GROUP5 : 1 << 5, // 0010 0000 
    GROUP6 : 1 << 6, // 0100 0000 
    GROUP7 : 1 << 7, // 1000 0000 
}
DEFAULT_COLLISION = CollisionGroups.GROUP0 | CollisionGroups.GROUP1 | CollisionGroups.GROUP2 | CollisionGroups.GROUP3 
| CollisionGroups.GROUP4 | CollisionGroups.GROUP5 | CollisionGroups.GROUP6 | CollisionGroups.GROUP7;

