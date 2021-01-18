const express = require('express')
const app = express()
const port = 5000

const bodyPaerser = require('body-parser')
const { User } = require('./models/User')
const { Favorite } = require('./models/Favorite')

const config = require('./config/key')

const cookieParser = require('cookie-parser')

const { auth } = require('./middleware/auth')

//application/x-www-form-urlencoded
app.use(bodyPaerser.urlencoded({ extended: true }))

//application/json
app.use(bodyPaerser.json())

app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true
}).then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err))

app.post('/api/users/register', (req, res) => {

    //회원 가입 할때 필요한 정보들을 클라이언트에서 가져오면
    //그것들을 데이터 베이스에 넣어 준다.

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })

})

app.post('/api/users/login', (req, res) => {

    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {//없으면
            return res.json({
                loginSuccess: false,
                message: "해당하는 이메일에 유저가 없습니다."
            })
        }
        //요청된 이메일이 데이터베이스에 있다면, 비밀번호가 맞는 비밀번호인지 확인.

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

            //비밀번호까지 맞다면 토큰을 생성하기
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지, 세션 여기서는 쿠키에
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userID: user._id })
            })
        })
    })
})

//auth는 미들웨어
app.get('/api/users/auth', auth, (req, res) => {

    //여기까지 미들웨어를 통과해 왔다는 얘기는 Auth이 True라는 말!
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, // role 0 -> 일반유저 role 0 이 아니면 관리자
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })

})

app.get('/api/users/logout', auth, (req, res) => {

    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).send({
            success: true
        })
    })

})

// favorite //

app.post('/api/favorite/favoriteNumber', (req, res) => {

    //mongoDB에서 favorite 숫자를 가져오기

    Favorite.find({ "movieID": req.body.movieId })
        .exec((err, info) => {
            if (err) return res.status(400).send(err)
            // 그 다음에 프론트에 다시 숫자 정보를 보내주기
            res.status(200).json({ success: true, favoriteNumber: info.length })
        })

})

app.post('/api/favorite/favorited', (req, res) => {

    //내가 이 영화를 Favorite 리스트에 넣었는지 정보를 DB 에서 받아온다.

    Favorite.find({ "movieID": req.body.movieId, "userFrom": req.body.userFrom })
        .exec((err, info) => {
            if (err) return res.status(400).send(err)
            // 그 다음에 프론트에 다시 숫자 정보를 보내주기

            let result = false;
            if (info.length !== 0) {
                result = true
            }

            res.status(200).json({ success: true, favorited: result })
        })

})

app.post('/api/favorite/removeFromFavorite', (req, res) => {

    Favorite.findOneAndDelete({ movieId: req.body.movieId, userFrom: req.body.userFrom })
    .exec( (err, doc) => {
        if (err) return res.status(400).send(err)
        return res.status(200).json({ success: true, doc })
    })

})

app.post('/api/favorite/addToFavorite', (req, res) => {

    //도큐먼트 객체 생성
    console.log(req.body)
    const favorite = new Favorite(req.body)

    favorite.save((err, doc) => {
        if (err) return res.status(400).send(err)
        return res.status(200).json({ success: true })
    })

})

app.post('/api/favorite/getFavoredMovie', (req, res) => {

    Favorite.find({ 'userFrom': req.body.userFrom})
    .exec( (err, favorites) => {
        if(err) return res.status(400).send(err)
        return res.status(200).json({ success: true, favorites: favorites})
    })

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})