import RALE, { Token, defaultLong, defaultWrapper, defaultUnique } from "./src/rale"

const defaultParams = {
    long: defaultLong,
    wrapper: defaultWrapper,
    unique: defaultUnique,
}

export default RALE;
export { RALE, defaultParams, Token };