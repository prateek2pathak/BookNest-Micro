# Book Management API

This project is a backend application for managing books using Node.js, Express, and MongoDB. It provides a RESTful API to perform CRUD operations on book records.

## Features

- Create, read, update, and delete books
- MongoDB for data storage
- Mongoose for object data modeling
- Express for building the API

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up your MongoDB database and update the connection string in `src/config/db.js`.

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The API will be available at `http://localhost:5000`.

## API Endpoints

- **GET /books**: Retrieve all books
- **GET /books/:id**: Retrieve a book by ID
- **POST /books**: Create a new book
- **PUT /books/:id**: Update a book by ID
- **DELETE /books/:id**: Delete a book by ID

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.