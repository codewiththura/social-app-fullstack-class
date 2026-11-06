require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { put } = require("@vercel/blob");

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
}

if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.memoryStorage(), limits:
        { fileSize: 5 * 1024 * 1024 }
    ,
    fileFilter: function fileFilter(req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    }
})

const uploadToBlob = async (file, folder) => {
    // cat.jpg -> jpg
    const ext = file.originalname.split(".").pop();
    // cat.jpg -> uploads/<unique-random-name>.jpg
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { url } = await put(filename, file.buffer, { access: 'public' });

    return url;
}

const deleteFromBlob = async (url) => {
    if (url) {
        try {
            await del(url);
        } catch (err) {
            console.log(err);
        }
    }
}

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        bio: { type: String, default: "" }
    },
    {
        timestamps: true
    }
);

// likesCount => number of like count
// isLiked => wherther logged user likes 
// isSaved => wherther logged user saves 
// likes => id Array of likeBy users
// savedBy => id Array of savedBy users

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        imageUrl: { type: String, default: "" }
    },
    {
        timestamps: true
    }
);

// Post -> Many Comments
// Comment -> User 
// user
// post
// body

const commentSchema = new mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        body: { type: String, required: true }
    }
)


const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

// Login ဝင်ထားဖို့ လိုမယ်
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.json({ message: "Authentication required" })
        }
        const token = authHeader.split(" ")[1];
        console.log(token);
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.json({ message: "User not found" })
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.json({ message: "Something went wrong!" })
    }
}

// Login ဝင်ထားလား/မထားတာလား?
const identifyUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);
            req.user = user;
        } catch {
            req.user = null;
        }
    }
    next();
}

app.post("/auth/register", async (req, res) => {
    const { name, username, email, password, bio } = req.body;

    const userExists = await User.findOne({ email })

    if (userExists) {
        return res.status(400).json({ message: "Email already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, username, email, password: hashedPassword, bio })

    res.status(200).json(user);
})

app.post("/auth/login", async (req, res) => {
    const { name, username, email, password, bio } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email" })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" })
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d"
    })

    res.json({ token: token, user });
})

app.get("/auth/me", authenticate, async (req, res) => {
    const user = req.user
    res.json(user)
})

app.post("/auth/logout", async (req, res) => {
    return res.status(400).json({ message: "Loggged out successfully" })
})

// ----- USER ROUTES ----
app.post("/users", async (req, res) => {
    const users = await User.create({ name: req.body.name, email: req.body.email })
    res.json(users);
})

app.get("/users", async (req, res) => {
    if (req.query.name) {
        const users = await User.findOne({ name: req.query.name });
    }
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    res.json(users);
})

app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
})

app.put("/users/:id", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const user = await User.findByIdAndUpdate(req.params.id, {
        name,
        email
    });
    res.json(user);
})

app.delete("/users/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    res.json(user);
})


// -----POST ROUTES-----

app.post("/posts", authenticate, async (req, res) => {
    const posts = await Post.create({ title: req.body.title, body: req.body.body, author: req.user._id, likes: [], savedBy: [] })
    res.json(posts);
})

app.get("/posts", identifyUser, async (req, res) => {
    const posts = await Post.find({})
        .populate("author", "name username email").sort({ createdAt: -1 }).lean();

    const formattedPosts = posts.map(p => {
        return {
            ...p,
            likesCount: p.likes ? p.likes.length : 0,
            isLiked: req.user ? p.likes.some(id => id.toString() === req.user._id.toString()) : false,
            isSaved: req.user ? p.savedBy.some(id => id.toString() === req.user._id.toString()) : false,
        }
    })
    res.json(formattedPosts);
})

app.get("/posts/:id", identifyUser, async (req, res) => {
    const post = await Post.findById(req.params.id).lean();
    const formattedPosts = {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        isLiked: req.user ? post.likes.some(id => id.toString() === req.user._id.toString()) : false,
        isSaved: req.user ? post.savedBy.some(id => id.toString() === req.user._id.toString()) : false,
    }
    res.json(formattedPosts);
})

app.put("/posts/:id", authenticate, async (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const post = await Post.findByIdAndUpdate(req.params.id, {
        title,
        body
    });
    res.json(post);
})

app.delete("/posts/:id", authenticate, async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.json(post);
})

app.post("/posts/:id/like", authenticate, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.json({ message: "Post not found" })
    }
    const currentUserId = req.user._id.toString();
    const index = post.likes.findIndex((id) => id.toString() === currentUserId);

    let isLiked = false;
    if (index > -1) {
        post.likes.splice(index, 1);
        isLiked = false;
    } else {
        post.likes.push(req.user._id);
        isLiked = true;
    }

    await post.save();
    // [1,3,5] -> index (0,1,..) , -1
    // 6

    // toggle -> like -> unlike -> liked
    res.json({ ...post.toObject(), isLiked, likesCount: post.likes.length });
})

app.post("/posts/:id/save", authenticate, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.json({ message: "Post not found" })
    }
    const currentUserId = req.user._id.toString();
    const index = post.savedBy.findIndex((id) => id.toString() === currentUserId);

    let isSaved = false;
    if (index > -1) {
        post.savedBy.splice(index, 1);
        isSaved = false;
    } else {
        post.savedBy.push(req.user._id);
        isSaved = true;
    }

    await post.save();
    // [1,3,5] -> index (0,1,..) , -1
    // 6

    // toggle -> like -> unlike -> liked
    res.json({ ...post.toObject(), isSaved, likesCount: post.likes.length });
})

app.post("/posts/:id/photo", authenticate, upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" })
        }

        const post = await Post.findById(req.params.id);
        await deleteFromBlob(post.imageUrl);
        const imageUrl = await uploadToBlob(req.file, "posts");
        post.imageUrl = imageUrl;
        await post.save();

        res.json({ message: "Post uploaded successfully" })

    } catch (err) {
        res.json({ message: "Post uploaded Error" })
        console.errr(err)
    }
})

// --- Comment Routes ---

app.get("/posts/:postId/comments", async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId }).populate("user", "name username email");
    res.json(comments);
})

app.post("/posts/:postId/comments", authenticate, async (req, res) => {
    const { body } = req.body;
    if (!body) {
        return res.json({ message: "Comment is required" })
    }

    const comment = await Comment.create({ body: body, post: req.params.postId, user: req.user._id, name: req.user.name, email: req.user.email });

    res.json(comment);
})




mongoose
    .connect(MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server started on port 3000");
        });
    })
    .catch((err) => console.error(err));
