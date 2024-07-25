module.exports = grammar({
  name: 'pint',

  rules: {
    source_file: $ => repeat(choice($.comment, $.decl)),

    comment: $ => token(seq('//', /.*/)),

    decl: $ => choice(
      $.decl_const,
      $.decl_enum,
      $.decl_iface,
      $.decl_macro_call,
      $.decl_macro,
      $.decl_new_ty,
      $.decl_pred,
      $.decl_storage,
      $.use_stmt,
    ),

    decl_const: $ => seq('const', $.ident, optional(seq(':', $.type)), '=', $.expr, ';'),

    decl_enum: $ => seq('enum', $.ident, '=', sep1($, $.ident, '|'), ';'),

    decl_iface: $ => seq('interface', $.ident, '{', repeat($.iface_body), '}'),

    iface_body: $ => choice(
      $.storage_block,
      $.pred_iface
    ),

    pred_iface: $ => seq('predicate', $.ident, '{', repeat($.iface_var), '}'),

    iface_var: $ => seq('pub', 'var', $.ident, ':', $.type, ';'),

    decl_macro_call: $ => seq($.expr_macro_call, ';'),

    decl_macro: $ => seq('macro', $.macro_name, '(', sep($, $.macro_param, ','), ')', $.block),

    decl_new_ty: $ => seq('type', $.ident, '=', $.type, ';'),

    decl_pred: $ => seq('predicate', $.ident, '{', repeat(choice($.comment, $.pred_body)), '}'),

    pred_body: $ => choice(
      $.decl_constraint,
      $.decl_if,
      $.iface_instance,
      $.decl_macro_call,
      $.pred_instance,
      $.decl_state,
      $.use_stmt,
      $.decl_var,
    ),

    decl_storage: $ => seq('storage', '{', sep($, $.storage_var, ','), optional(','), '}'),

    storage_var: $ => seq($.ident, ':', $.type),

    storage_block: $ => seq('storage', '{', sep($, $.storage_var, ','), optional(','), '}'),

    use_stmt: $ => seq('use', optional('::'), $.use_tree, ';'),

    use_tree: $ => choice(
      $.ident,
      seq($.ident, '::', $.use_tree),
      seq('{', sep($, $.use_tree, ','), '}'),
      seq($.ident, 'as', $.ident)
    ),

    decl_constraint: $ => seq('constraint', $.expr, ';'),

    decl_if: $ => seq('if', $.expr, $.block, optional(seq('else', choice($.block, $.decl_if)))),

    iface_instance: $ => seq('interface', $.ident, '=', $.path, '(', $.expr, ')', ';'),

    pred_instance: $ => seq('predicate', $.ident, '=', optional('::'), sep1($, $.ident, '::'), '(', $.expr, ')', ';'),

    decl_state: $ => seq('state', $.ident, optional(seq(':', $.type)), '=', $.state_init, ';'),

    decl_var: $ => seq(optional('pub'), 'var', $.ident, optional(seq(':', $.type)), optional(seq('=', $.expr)), ';'),

    block: $ => seq('{', repeat(choice($.comment, $.pred_body)), '}'),

    expr: $ => choice(
      $.expr_select,
      $.expr_logical_or,
      $.expr_logical_and,
      $.expr_cmp,
      $.expr_additive,
      $.expr_multiplicative,
      $.expr_unary,
      $.expr_postfix,
      $.term,
    ),

    expr_select: $ => prec.right(seq($.expr, '?', $.expr, ':', $.expr)),

    expr_logical_or: $ => prec.left(seq($.expr, '||', $.expr)),

    expr_logical_and: $ => prec.left(seq($.expr, '&&', $.expr)),

    expr_cmp: $ => prec.left(seq($.expr, choice('==', '!=', '<', '<=', '>', '>='), $.expr)),

    expr_additive: $ => prec.left(seq($.expr, choice('+', '-'), $.expr)),

    expr_multiplicative: $ => prec.left(seq($.expr, choice('*', '/', '%'), $.expr)),

    expr_unary: $ => prec.right(seq(choice('+', '-', '!'), $.expr)),

    expr_postfix: $ => prec.left(choice(
      seq($.expr, '[', $.expr, ']'),
      seq($.expr, '[', ']'),
      seq($.expr, '.', $.ident),
      seq($.expr, '.', $.number)
    )),

    term: $ => prec(1, choice(
      $.ident_post_state,
      $.ident,
      $.lit,
      seq('(', $.expr, ')'),
      $.expr_macro_call,
      $.expr_cond,
      $.expr_generator,
      $.expr_array,
      $.expr_tuple,
      $.path,
      $.macro_param
    )),

    lit: $ => choice(
      $.number,
      $.hex,
      $.string,
    ),

    expr_cond: $ => seq('cond', '{', sep($, $.cond_branch, ','), $.else_branch, '}'),

    cond_branch: $ => seq($.expr, '=>', $.expr),

    else_branch: $ => seq('else', '=>', $.expr),

    expr_generator: $ => choice(
      seq('forall', sep1($, $.generator_range, ','), optional(seq('where', sep1($, $.expr, ','))), '{', $.expr, '}'),
      seq('exists', sep1($, $.generator_range, ','), optional(seq('where', sep1($, $.expr, ','))), '{', $.expr, '}')
    ),

    generator_range: $ => seq($.ident, 'in', $.expr),

    expr_array: $ => seq('[', sep($, $.expr, ','), ']'),

    expr_tuple: $ => seq('{', sep($, $.expr_tuple_field, ','), optional(','), '}'),

    expr_tuple_field: $ => choice(
      seq($.ident, ':', $.expr),
      $.expr
    ),

    state_init: $ => choice(
      $.storage_access,
      $.expr
    ),

    storage_access: $ => seq('storage', '::', $.ident),

    expr_macro_call: $ => seq($.macro_path, optional('macro_tag'), $.macro_args),

    macro_path: $ => seq('@', $.path),

    macro_args: $ => /macro_call_args/,

    macro_body: $ => /macro_body/,

    path: $ => choice(
      seq('::', sep1($, $.ident, '::')),
      sep1($, $.ident, '::')
    ),

    type: $ => choice(
      $.ty_prim,
      $.ty_custom,
      $.ty_array,
      $.ty_tuple,
      $.ty_map,
    ),

    ty_array: $ => choice(
      seq($.type, '[', $.type, ']'),
      seq($.type, '[', ']'),
    ),

    ty_tuple: $ => seq('{', sep($, $.ty_tuple_field, ','), optional(','), '}'),

    ty_tuple_field: $ => choice(
      seq($.ident, ':', $.type),
      $.type
    ),

    ty_prim: $ => choice(
      'ty_int',
      'ty_real',
      'ty_bool',
      'ty_string',
      'ty_b256'
    ),

    hex: $ => /0x[0-9a-fA-F]+/,

    ty_custom: $ => $.path,

    ty_map: $ => seq('(', $.type, '=>', $.type, ')'),

    ident_post_state: $ => /[a-zA-Z_][a-zA-Z0-9_]*'/,

    ident: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    macro_param: $ => seq('$', $.ident),

    number: $ => /[0-9]+(\.[0-9]+)?/,

    string: $ => /"([^"\\]|\\.)*"/,

    macro_name: $ => /@[a-zA-Z_][a-zA-Z0-9_]*/,
  }
});

function sep1($, rule, separator) {
  return seq(rule, repeat(seq(separator, optional($.comment), rule)));
}

function sep($, rule, separator) {
  return optional(sep1($, rule, separator));
}
