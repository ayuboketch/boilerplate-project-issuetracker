const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Store _id to use in tests
  let testId;
  
  // Create an issue with every field: POST request to `/api/issues/{project}`
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Chai Test',
        assigned_to: 'Tester',
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue');
        assert.equal(res.body.created_by, 'Chai Test');
        assert.equal(res.body.assigned_to, 'Tester');
        assert.equal(res.body.status_text, 'In QA');
        assert.isTrue(res.body.open);
        
        // Save the _id for later tests
        testId = res.body._id;
        done();
      });
  });
  
  // Create an issue with only required fields: POST request to `/api/issues/{project}`
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Required Fields Only',
        issue_text: 'This issue has only required fields',
        created_by: 'Chai Test'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.equal(res.body.issue_title, 'Required Fields Only');
        assert.equal(res.body.issue_text, 'This issue has only required fields');
        assert.equal(res.body.created_by, 'Chai Test');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        done();
      });
  });
  
  // Create an issue with missing required fields: POST request to `/api/issues/{project}`
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Missing Fields',
        // Missing issue_text and created_by
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });
  
  // View issues on a project: GET request to `/api/issues/{project}`
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2); // Should have at least the two issues we created
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
  });
  
  // View issues on a project with one filter: GET request to `/api/issues/{project}`
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?created_by=Chai Test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        // All results should have created_by = 'Chai Test'
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Chai Test');
        });
        done();
      });
  });
  
  // View issues on a project with multiple filters: GET request to `/api/issues/{project}`
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?created_by=Chai Test&open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // All results should match both filters
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Chai Test');
          assert.isTrue(issue.open);
        });
        done();
      });
  });
  
  // Update one field on an issue: PUT request to `/api/issues/{project}`
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId,
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  // Update multiple fields on an issue: PUT request to `/api/issues/{project}`
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId,
        issue_title: 'Multiple Updates',
        issue_text: 'This issue has been updated with multiple fields',
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  // Update an issue with missing _id: PUT request to `/api/issues/{project}`
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'Missing ID Update'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  
  // Update an issue with no fields to update: PUT request to `/api/issues/{project}`
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.property(res.body, '_id');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  // Update an issue with an invalid _id: PUT request to `/api/issues/{project}`
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid_id',
        issue_title: 'Invalid ID Update'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        assert.property(res.body, '_id');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });
  
  // Delete an issue: DELETE request to `/api/issues/{project}`
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: testId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  // Delete an issue with an invalid _id: DELETE request to `/api/issues/{project}`
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: 'invalid_id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not delete');
        assert.property(res.body, '_id');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });
  
  // Delete an issue with missing _id: DELETE request to `/api/issues/{project}`
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});