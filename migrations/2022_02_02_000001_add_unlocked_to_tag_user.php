<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('tag_user', function (Blueprint $table) {
            $table->boolean('is_unlocked')->default(false);
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('tag_user', function (Blueprint $table) {
            $table->dropColumn('is_unlocked');
        });
    },
];
