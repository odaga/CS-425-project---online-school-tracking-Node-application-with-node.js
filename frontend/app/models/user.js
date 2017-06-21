import DS from 'ember-data';

export default DS.Model.extend({
  user_name: DS.attr('string'),
  user_email: DS.attr('string'),
  department: DS.belongsTo('department',{ async: true, inverse: null }),
});
