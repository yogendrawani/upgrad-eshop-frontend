# upGrad E-Shop (Frontend)

React frontend for the upGrad E-Shop project. It talks to the hosted API at
`https://dev-project-ecommerce.upgrad.dev/api`.

## Features
- Sign up / sign in (normal user and admin)
- Navigation bar that changes based on login state and role
- Products page with category tabs, sorting and search
- Product details page and a 3 step order flow (items, address, confirm)
- Admin: add, modify and delete products

## Built with
React 17, React Router 5, Material-UI v4, react-select

## How to run
```
npm install
npm start
```
The app opens on http://localhost:3000

## Folder structure
```
src/
  assets/       images and other resources
  common/       api helper, context, protected route, shared components
  components/   one folder per component (JS + CSS)
  index.js
  index.css
```

## Notes
- Create an admin by signing up with `"role": "ADMIN"` in the request body (see the API guide).
  The sign up form creates normal users only.
