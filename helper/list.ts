export const enumToArray = (enums) => {
    return Object.keys(enums)
        .filter((value) => false === isNaN(Number(value)))
        .map((key) => enums[key]);
};

export const enumToArrayNotSort = (enums) => {
    const valueArray = Object.values(enums).filter((value) => false === isNaN(Number(value)));
    const returnArray = [];
    for (let i = 0; i < valueArray.length; i++) {
        returnArray.push(enums[`${valueArray[i]}`]);
    }
    return returnArray;
};
