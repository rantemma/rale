import RSL, { Token, defaultLong, defaultWrapper, defaultUnique } from "./src/rale"

const defaultParams = {
    long: defaultLong,
    wrapper: defaultWrapper,
    unique: defaultUnique,
}

export default RSL;
export { RSL, defaultParams, Token };