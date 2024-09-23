// Used by the content script 


enum TwitterTheme {
    White = "css-175oi2r r-j5o65s r-qklmqi r-1adg3ll r-1ny4l3l",
    White_2 = "css-175oi2r r-1adg3ll r-1ny4l3l",
    Dim = "css-175oi2r r-1ila09b r-qklmqi r-1adg3ll r-1ny4l3l",
    Dim_2 = "css-175oi2r r-1adg3ll r-1ny4l3l",
    Dark = "css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l",
    Dark2 = "css-175oi2r r-1adg3ll r-1ny4l3l"
}

type TweetBodyWrapper = HTMLDivElement | Node | ChildNode;

export {
    TwitterTheme,
    TweetBodyWrapper,
}