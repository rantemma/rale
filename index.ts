import Rale, { Token, Unique, Long, Wrapper, defaultLong, defaultWrapper, defaultUnique } from "./src/rale"

const defaultParams = {
    long: defaultLong,
    wrapper: defaultWrapper,
    unique: defaultUnique,
}

export default Rale;
export { Rale, defaultParams, Token, Unique, Long, Wrapper };