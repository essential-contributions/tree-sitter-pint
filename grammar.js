module.exports = grammar({
  name: 'pint',

  rules: {
    source_file: $ => repeat($.decl),

    decl: $ => choice(
      $.const_decl,
      $.enum_decl,
      $.interface_decl,
      $.macro_call_decl,
      $.macro_decl,
      $.new_type_decl,
      $.predicate_decl,
      $.storage_decl,
      $.use_stmt,
    ),

    const_decl: $ => seq('const', $.ident, optional(seq(':', $.type)), '=', $.expr, ';'),

    enum_decl: $ => seq('enum', $.ident, '=', sep1($.ident, '|'), ';'),

    interface_decl: $ => seq('interface', $.ident, '{', repeat($.interface_body), '}'),

    interface_body: $ => choice(
      $.storage_block,
      $.predicate_interface
    ),

    predicate_interface: $ => seq('predicate', $.ident, '{', repeat($.interface_var), '}'),

    interface_var: $ => seq('pub', 'var', $.ident, ':', $.type, ';'),

    macro_call_decl: $ => seq($.macro_call_expr, ';'),

    macro_decl: $ => seq('macro', $.macro_name, '(', sep($.macro_param, ','), ')', $.block),

    new_type_decl: $ => seq('type', $.ident, '=', $.type, ';'),

    predicate_decl: $ => seq('predicate', $.ident, '{', repeat($.predicate_body), '}'),

    predicate_body: $ => choice(
      $.constraint_decl,
      $.if_decl,
      $.interface_instance,
      $.macro_call_decl,
      $.predicate_instance,
      $.state_decl,
      $.use_stmt,
      $.var_decl,
    ),

    storage_decl: $ => seq('storage', '{', sep($.storage_var, ','), '}'),

    storage_var: $ => seq($.ident, ':', $.type, ','),

    storage_block: $ => seq('storage', '{', sep($.storage_var, ','), '}'),

    use_stmt: $ => seq('use', optional('::'), $.use_tree, ';'),

    use_tree: $ => choice(
      $.ident,
      seq($.ident, '::', $.use_tree),
      seq('{', sep($.use_tree, ','), '}'),
      seq($.ident, 'as', $.ident)
    ),

    constraint_decl: $ => seq('constraint', $.expr, ';'),

    if_decl: $ => seq('if', $.expr, $.block, optional(seq('else', choice($.block, $.if_decl)))),

    interface_instance: $ => seq('interface', $.ident, '=', $.path, '(', $.expr, ')', ';'),

    predicate_instance: $ => seq('predicate', $.ident, '=', optional('::'), sep1($.ident, '::'), '(', $.expr, ')', ';'),

    state_decl: $ => seq('state', $.ident, optional(seq(':', $.type)), '=', $.state_init, ';'),

    var_decl: $ => seq(optional('pub'), 'var', $.ident, optional(seq(':', $.type)), optional(seq('=', $.expr)), ';'),

    block: $ => seq('{', repeat($.predicate_body), '}'),

    expr: $ => choice(
      $.select_expr,
      $.logical_or_expr,
      $.logical_and_expr,
      $.comparison_expr,
      $.additive_expr,
      $.multiplicative_expr,
      $.unary_expr,
      $.postfix_expr,
      $.term,
    ),

    select_expr: $ => prec.right(seq($.expr, '?', $.expr, ':', $.expr)),

    logical_or_expr: $ => prec.left(seq($.expr, '||', $.expr)),

    logical_and_expr: $ => prec.left(seq($.expr, '&&', $.expr)),

    comparison_expr: $ => prec.left(seq($.expr, choice('==', '!=', '<', '<=', '>', '>='), $.expr)),

    additive_expr: $ => prec.left(seq($.expr, choice('+', '-'), $.expr)),

    multiplicative_expr: $ => prec.left(seq($.expr, choice('*', '/', '%'), $.expr)),

    unary_expr: $ => prec.right(seq(choice('+', '-', '!'), $.expr)),

    postfix_expr: $ => prec.left(choice(
      seq($.expr, '[', $.expr, ']'),
      seq($.expr, '[', ']'),
      seq($.expr, '.', $.ident),
      seq($.expr, '.', $.number),
      seq($.expr, "'")
    )),

    term: $ => prec(1, choice(
      $.ident,
      $.number,
      $.string,
      seq('(', $.expr, ')'),
      $.macro_call_expr,
      $.cond_expr,
      $.generator_expr,
      $.array_expr,
      $.tuple_expr,
      $.path,
      $.macro_param
    )),

    cond_expr: $ => seq('cond', '{', sep($.cond_branch, ','), $.else_branch, '}'),

    cond_branch: $ => seq($.expr, '=>', $.expr),

    else_branch: $ => seq('else', '=>', $.expr),

    generator_expr: $ => choice(
      seq('forall', sep1($.generator_range, ','), optional(seq('where', sep1($.expr, ','))), '{', $.expr, '}'),
      seq('exists', sep1($.generator_range, ','), optional(seq('where', sep1($.expr, ','))), '{', $.expr, '}')
    ),

    generator_range: $ => seq($.ident, 'in', $.expr),

    array_expr: $ => seq('[', sep($.expr, ','), ']'),

    tuple_expr: $ => seq('{', sep($.tuple_field, ','), '}'),

    tuple_field: $ => choice(
      seq($.ident, ':', $.expr),
      $.expr
    ),

    state_init: $ => choice(
      $.storage_access,
      $.expr
    ),

    storage_access: $ => seq('storage', '::', $.ident),

    macro_call_expr: $ => seq($.macro_path, optional('macro_tag'), $.macro_args),

    macro_path: $ => seq('@', $.path),

    macro_args: $ => /macro_call_args/,

    macro_body: $ => /macro_body/,

    path: $ => choice(
      seq('::', sep1($.ident, '::')),
      sep1($.ident, '::')
    ),

    type: $ => choice(
      $.primitive_type,
      $.custom_type,
      seq($.type, '[', $.expr, ']'),
      seq($.type, '[', ']'),
      seq('{', sep($.tuple_field, ','), '}'),
    ),

    primitive_type: $ => choice(
      'int_ty',
      'real_ty',
      'bool_ty',
      'string_ty',
      'b256_ty'
    ),

    custom_type: $ => $.path,

    ident: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    macro_param: $ => seq('$', $.ident),

    number: $ => /[0-9]+(\.[0-9]+)?/,

    string: $ => /"([^"\\]|\\.)*"/,

    macro_name: $ => /@[a-zA-Z_][a-zA-Z0-9_]*/,

    comment: $ => token(seq('//', /.*/)),
  }
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function sep(rule, separator) {
  return optional(sep1(rule, separator));
}
