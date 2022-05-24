

export const countTimeElapsedFormatter = (number) => {
    const zeroDate = new Date(0);
    const dateUTC = new Date(new Number(number));
    const years = dateUTC.getFullYear()-zeroDate.getFullYear();
    const months = dateUTC.getMonth();
    return years*12+months<24?`${years*12+months}m.`:`${years}l.`
}