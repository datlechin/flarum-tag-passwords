<?php

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('tags', function (Blueprint $table) {
            $table->string('password')->nullable();
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('tags', function (Blueprint $table) {
            $table->dropColumn('password');
        });
    },
];
