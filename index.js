const express = require('express');
const app = express();
const port = 3001;
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

// body parser middleware
app.use(express.json());

app.use(cors());

// connect to mongodb
app.use(async (req, res, next) => {
  const uri = `mongodb+srv://christsang:${process.env.MONGODB_PW}@cluster0.vlponpx.mongodb.net/`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('connected to mongodb');
    req.db = client.db('booking');
  } catch (err) {
    console.log(err);
    return;
  }

  next();
});

// set frontend folder as static folder for static file
app.use(express.static('frontend/build'));

app.get('/api/booking_for_one_date', async (req, res) => {
  console.log('get all bookings for specific date')

  var { date } = req.query;

  // get all bookings for specific date
  var bookings = await req.db.collection('bookings').find({ date }).toArray();
  console.log(date, bookings);

  res.json(bookings);
});

// get one booking based on _id
app.get('/api/booking/:id', async (req, res) => {
  console.log('get one booking', req.params.id)

  var { id } = req.params;

  // get one booking based on _id. need to transform id to ObjectId
  var booking = await req.db.collection('bookings').findOne({ _id: new ObjectId(id) });

  console.log(booking);

  res.json(booking);
});

app.get('/api/booking', async (req, res) => {
  console.log('get all bookings')
  var { year, week } = req.query;
  var daysOfWeek = getDaysOfWeek(year, week);

  // Convert dates to 'YYYY-MM-DD' format
  var formattedDaysOfWeek = daysOfWeek.map(date => {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-based in JavaScript
    var day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  });

  console.log(year, week, formattedDaysOfWeek);

  // get all bookings that are in the week
  var allBookings = await req.db.collection('bookings').find({ date: { $in: formattedDaysOfWeek } }).toArray();

  console.log(allBookings);

  res.json(allBookings);
});

app.post('/api/booking', async (req, res) => {
  console.log(req.body);
  var { topic, date, timeslot, remark } = req.body;

  timeslot = timeslot.value;

  // insert into mongoreq.db
  var createNewBooking = await req.db.collection('bookings').insertOne({ topic, date, timeslot, remark });

  if (createNewBooking.insertedId) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// an update request to update booking
app.put('/api/booking', async (req, res) => {
  console.log('update', req.body);
  var { id, topic, date, timeslot, remark } = req.body;

  timeslot = timeslot.value;

  // update booking
  var updateBooking = await req.db.collection('bookings').updateOne({ _id: new ObjectId(id) }, { $set: { topic, date, timeslot, remark } });

  if (updateBooking.modifiedCount === 1) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// an delete request to delete booking
app.delete('/api/booking', async (req, res) => {
  console.log(req.body);
  var { id } = req.body;

  // delete booking
  var deleteBooking = await req.db.collection('bookings').deleteOne({ _id: new ObjectId(id) });

  if (deleteBooking.deletedCount === 1) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get('/', (req, res) => {
  // redirect to frontend/build
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function getDaysOfWeek(year, week) {
  // Create a date object pointing to the first day of the year
  var date = new Date(year, 0, 1);

  // Set the date to the number of days equivalent to the week number
  // Note: *7 because a week consists of 7 days
  date.setDate(week * 7);

  // Adjust to Monday of the current week
  var day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

  // Array to store all dates of the week
  var datesOfWeek = [];

  // Loop over the days of the week
  for (var i = 0; i < 7; i++) {
      // Push a new date that is `i` days after the start of the week
      datesOfWeek.push(new Date(date.getTime() + i * 24 * 60 * 60 * 1000));
  }

  return datesOfWeek;
}