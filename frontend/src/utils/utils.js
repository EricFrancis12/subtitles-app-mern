

export function isNil(any) {
    return any === undefined || any === null;
}

export function isEmpty(any) {
    return isNil(any) || any === '';
}

export function highest(numbersArr) {
    if (!numbersArr?.length) return null;

    return numbersArr.reduce((highest, currentNumber) => {
        return currentNumber > highest ? currentNumber : highest;
    }, numbersArr[0]);
}

export function mean(numbersArr) {
    if (!numbersArr?.length) return null;

    const sum = numbersArr.reduce((acc, num) => acc + num, 0);
    return sum / numbersArr.length;
}
