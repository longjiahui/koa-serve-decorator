const errno={
    //
    ERR_ARG: 'arg error',
    ERR_NOTOKEN: 'no token, maybe not login',
    ERR_VERIFY_ERROR: 'verify error',

    //
    ERR_GETTOKEN_ERROR: '[system] get token function must be set',
    ERR_GETJWTSECRET_ERROR: '[system] jwtsecret must be set',

    ERR_BEFOREROUTE_RETURN_FALSE: 'beforeRoute return false',
    ERR_AFTERROUTE_RETURN_FALSE: 'afterRoute return false',
}
const err = {
    ERR_ARG: (msg)=>({
        code: errno.ERR_ARG,
        msg
    }),
    ERR_NOTOKEN: {
        code: errno.ERR_NOTOKEN,
        msg: errno.ERR_NOTOKEN
    },
    ERR_VERIFY_ERROR: msg=>({
        code: errno.ERR_VERIFY_ERROR,
        msg,
    }),
    ERR_BEFOREROUTE_RETURN_FALSE: name=>({
        code: ERR_BEFOREROUTE_RETURN_FALSE,
        msg: `beforeRoute[${name}] return false`
    }),
    ERR_AFTERROUTE_RETURN_FALSE: name=>({
        code: ERR_AFTERROUTE_RETURN_FALSE,
        msg: `beforeRoute[${name}] return false`
    })
}

module.exports = {
    errno, err
}